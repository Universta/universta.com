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
 * The stub therefore mirrors the contract, not the implementation: a labelled
 * editable region holding `value`, plus the variable and media controls the
 * wrapper adds beside the toolbar.
 */
export function JoditRichText({
  label,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  allowedVariables = [],
  enableImages = true,
  media = [],
  ariaLabel,
  hideLabel = false,
}: RichTextEditorProps) {
  const isDisabled = disabled || readOnly;
  return (
    <div className="text-sm font-semibold">
      {hideLabel ? null : <span className="mb-2 block">{label}</span>}
      {allowedVariables.length ? (
        <label className="text-xs font-semibold">
          Insert variable
          <select
            aria-label={`Insert variable into ${label}`}
            disabled={isDisabled}
            value=""
            onChange={(event) =>
              event.target.value && onChange(`${value ?? ''}{${event.target.value}}`)
            }
          >
            <option value="">Choose…</option>
            {allowedVariables.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
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
        dangerouslySetInnerHTML={{ __html: value ?? '' }}
        onInput={(event) => onChange((event.target as HTMLElement).innerHTML)}
      />
    </div>
  );
}
