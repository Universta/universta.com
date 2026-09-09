'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import { Jodit } from 'jodit';
import type { IJodit } from 'jodit/esm/types/jodit';
import { MediaPickerDialog } from '@/features/catalog/editorial/MediaPickerDialog';
import type { EditorialMedia } from '@/features/catalog/catalog.types';
import type { DynamicVariable } from './variable-autocomplete';
import { sanitizeEditorHtml, type RichTextEditorProps } from './RichTextEditor';

/**
 * The Admin WYSIWYG, wrapping Jodit's own editor and toolbar.
 *
 * Two hand-rolled editors preceded this one -- `document.execCommand`, then a
 * Tiptap toolbar we wired command by command -- and both spent their bugs in
 * the same place: selection handling. Applying a list to a selected paragraph
 * is exactly the sort of thing an editor library has already solved, so this
 * configures Jodit's ready-made toolbar rather than reimplementing it.
 *
 * Browser-only, so it is loaded through `RichTextEditor` with SSR disabled.
 */

/** The stored tag set, kept identical to the API's `sanitizeRichText` and the
 * public `RichText` renderer. Jodit is configured to emit only these, so what
 * the editor produces is already in contract and no per-keystroke rewrite is
 * needed -- a rewrite would also defeat the wrapper's echo guard and reset the
 * caret on every character. */
const ALLOWED = 'p,br,strong,b,em,i,u,s,strike,ul,ol,li,a,blockquote,h2,h3,h4,img';


export function JoditRichText({
  label,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  allowedVariables = [],
  enableImages = true,
  media = [],
  minHeight = 'min-h-36',
  ariaLabel,
  placeholder,
  hideLabel = false,
}: RichTextEditorProps) {
  const isDisabled = disabled || readOnly;
  const editorRef = useRef<IJodit | null>(null);
  const [variable, setVariable] = useState('');
  /* Read inside a Jodit command callback, which is created once and would
   * otherwise capture the first render's handler. */
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /* Both of these have to keep a stable identity. jodit-react rebuilds the
   * editor whenever `config` or `editorRef` changes, and it subscribes to the
   * editor's `change` event only once -- so an inline callback here quietly
   * destroyed and recreated Jodit on every render, leaving that subscription
   * bound to a dead instance. Formatting applied in the editor and then never
   * reached the form. */
  const captureEditor = useCallback((editor: IJodit) => {
    editorRef.current = editor;
  }, []);
  const handleChange = useCallback((next: string) => {
    onChangeRef.current(next);
  }, []);
  /* Trim the value to the stored subset when the operator leaves the field.
   * Doing it per keystroke would rewrite what the editor just emitted, and the
   * wrapper would then reset the document and move the caret. On blur there is
   * no caret to lose, and anything pasted in -- Word wrappers, a stray heading
   * level, a script tag -- is normalised before it can be saved. The API
   * sanitises every write path as well; this is tidiness, not the boundary. */
  const handleBlur = useCallback((next: string) => {
    onChangeRef.current(sanitizeEditorHtml(next));
  }, []);

  /** Applies or removes a list through Jodit's own style engine. See the
   * comment on `controls.ul` for why its default control cannot toggle off. */
  const listExec = useCallback(
    (element: 'ul' | 'ol') =>
      (jodit: IJodit, _: unknown, { control }: { control: { args?: unknown[] } }) => {
        const chosen = control.args?.[0];
        jodit.s.commitStyle(
          typeof chosen === 'string' && chosen !== 'default'
            ? { element, attributes: { style: { listStyleType: chosen } } }
            : { element },
        );
        /* Report once the unwrap has settled in the DOM, and report it
         * ourselves: Jodit records the post-toggle value internally before its
         * own `change` event would carry it, so the form heard about turning a
         * list on but never about turning it off. Jodit's async manager is used
         * so the callback is dropped if the editor is destroyed first. */
        jodit.async.setTimeout(() => {
          jodit.setEditorValue();
          onChangeRef.current(jodit.value);
        }, 0);
      },
    [],
  );

  const config = useMemo(
    () => ({
      readonly: isDisabled,
      placeholder: placeholder ?? '',
      /* Jodit's own toolbar. The paragraph dropdown is replaced rather than
       * extended -- `Jodit.atom` is what stops it merging with the default
       * list, which offers H1 and `pre`, neither of which survives the stored
       * tag set. Offering a format that is silently dropped on save is worse
       * than not offering it. */
      buttons: [
        'paragraph',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'ul',
        'ol',
        '|',
        'left',
        'center',
        'right',
        '|',
        'link',
        '|',
        'undo',
        'redo',
        '|',
        'eraser',
      ],
      controls: {
        /* Jodit's own list buttons always pass `listStyleType`, even when no
         * style was picked from their dropdown. Its style engine reads that as
         * "apply with different attributes" rather than "same style again", so
         * clicking Bullet List inside a list re-applied it instead of
         * unwrapping -- the list could be turned on but never off. Committing
         * without the attribute toggles correctly; an explicitly chosen style
         * still carries one. The engine, the dropdown and the button are all
         * still Jodit's. */
        ul: { exec: listExec('ul') },
        ol: { exec: listExec('ol') },
        paragraph: {
          list: Jodit.atom({
            p: 'Normal',
            h2: 'Heading 2',
            h3: 'Heading 3',
            h4: 'Heading 4',
            blockquote: 'Quote',
          }),
        },
      },
      /* Paste keeps its formatting -- that is the point of the field -- but
       * Word and Docs wrappers are cleaned, and nothing outside the stored tag
       * set survives. This is convenience, not security: the API sanitises
       * every rich-text write path regardless of what arrives. */
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_as_html' as const,
      processPasteHTML: true,
      cleanHTML: {
        allowTags: ALLOWED,
        cleanOnPaste: true,
        removeEmptyElements: false,
        fillEmptyParagraph: false,
      },
      /* Universta already has a Media Library. Jodit must not become a second
       * upload path, so base64 embedding and its own uploader are both off. */
      uploader: { insertImageAsBase64URI: false, url: '' },
      disablePlugins: ['image-processor', 'image-properties', 'file', 'video', 'media'],
      enableDragAndDropFileToEditor: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      statusbar: false,
      toolbarAdaptive: false,
      minHeight: 180,
    }),
    [isDisabled, placeholder, listExec],
  );

  const insertHtml = useCallback((html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.selection.focus();
    editor.selection.insertHTML(html);
  }, []);

  const insertMedia = useCallback(
    (mediaId: string) => {
      const item = media.find((row) => row.id === mediaId);
      if (!item || !/^(https?:\/\/|\/)/i.test(item.url)) return;
      const alt = (item.alt || item.title || '').replace(/"/g, '&quot;');
      insertHtml(`<img src="${item.url}" alt="${alt}">`);
    },
    [insertHtml, media],
  );

  const insertVariable = useCallback(
    (key: string) => {
      if (!key) return;
      insertHtml(`{${key}}`);
      setVariable('');
    },
    [insertHtml],
  );

  return (
    <div className={`text-sm font-semibold ${minHeight ? '' : ''}`}>
      {hideLabel ? null : <span className="mb-2 block">{label}</span>}
      {allowedVariables.length || (enableImages && media.length) ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {allowedVariables.length ? (
            <label className="flex items-center gap-2 text-xs font-semibold text-[#475467]">
              Insert variable
              <select
                aria-label={`Insert variable into ${label}`}
                className="rounded-lg border border-[#D9E0EA] px-2 py-1 font-normal"
                value={variable}
                disabled={isDisabled}
                onChange={(event) => insertVariable(event.target.value)}
              >
                <option value="">Choose…</option>
                {allowedVariables.map((item: DynamicVariable) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {enableImages && media.length ? (
            <MediaPickerDialog
              label="Insert image"
              value=""
              media={media}
              onChange={insertMedia}
            />
          ) : null}
        </div>
      ) : null}
      <div data-rte={label} aria-label={ariaLabel ?? label}>
        <JoditEditor
          value={value ?? ''}
          config={config}
          onChange={handleChange}
          onBlur={handleBlur}
          editorRef={captureEditor}
        />
      </div>
    </div>
  );
}
