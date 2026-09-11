import type { RichTextEditorProps } from '@/features/shared/RichTextEditor';

/**
 * Stands in for the Jodit editor in jsdom.
 *
 * Jodit drives a real contenteditable and never finishes initialising under
 * jsdom, so unit tests that rendered it simply timed out. Its own behaviour --
 * selection, lists, undo -- belongs to the library and is verified in a real
 * browser instead; what these tests need is the seam around it: that a field
 * exists, is a rich-text control, carries the stored value, and reports edits
 * back to the form.
 *
 * The stub therefore mirrors the contract, not the implementation. The inline
 * `%` autocomplete is deliberately not reproduced here: it reads a live caret
 * out of a contenteditable, which is exactly the class of behaviour this stub
 * exists to avoid faking. Its rules are unit-tested directly against
 * `entity-autocomplete.ts`, and its wiring is covered by a browser test. What
 * the stub does carry is the context the editor is handed, so a form can be
 * asserted to have passed the right one.
 */
export function JoditRichText({
  label,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  enableImages = true,
  media = [],
  ariaLabel,
  hideLabel = false,
  entityContext,
}: RichTextEditorProps) {
  const isDisabled = disabled || readOnly;
  return (
    <div className="text-sm font-semibold">
      {hideLabel ? null : <span className="mb-2 block">{label}</span>}
      {enableImages && media.length ? (
        <button
          type="button"
          aria-label="Insert image"
          onClick={() =>
            onChange(`${value ?? ''}<img src="${media[0].url}" alt="${media[0].alt ?? ''}">`)
          }
        >
          Insert image
        </button>
      ) : null}
      <div
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel ?? label}
        contentEditable={!isDisabled}
        suppressContentEditableWarning
        data-rte-value={value ?? ''}
        data-rte-country={entityContext?.countryId ?? ''}
        data-rte-variable-context={entityContext?.variableContext ?? ''}
        dangerouslySetInnerHTML={{ __html: value ?? '' }}
        onInput={(event) => onChange((event.target as HTMLElement).innerHTML)}
      />
    </div>
  );
}
