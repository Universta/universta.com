'use client';

import { useEffect, useRef, useState } from 'react';
import { RichText, richTextToPlainText } from '../phase1/RichText';

/**
 * The one progressive-disclosure control on the country pages.
 *
 * There were two of these — a card version that flattened markup and clamped
 * lines, and a prose version that kept markup and clamped height — which meant
 * two thresholds, two sets of spacing and two chances to get the measurement
 * wrong. They are one component with two rendering modes now, so "Read more"
 * looks and behaves identically wherever it appears.
 *
 * `text` flattens the stored markup through the sanitiser and clamps by line,
 * which is what a listing card wants: a readable summary, never a tag.
 * `rich` renders the markup and clamps the container by height, which is what
 * an overview wants: paragraphs, lists, bold and links all intact.
 *
 * The part that matters in both modes is that the collapsed state is only ever
 * *applied* when there is genuinely something hidden. A block that fits shows
 * no fade and no control; a block that does not shows both. Getting that wrong
 * is what produced copy fading out at the bottom of a card with no way to read
 * the rest of it.
 */
export function Disclosure({
  value,
  mode = 'rich',
  lines = 5,
  collapsedHeight = 132,
  moreLabel = 'Read more',
  lessLabel = 'Read less',
  describes,
  className,
}: {
  value: string | null | undefined;
  /** `text` for a card summary, `rich` to keep the authored formatting. */
  mode?: 'text' | 'rich';
  /** Collapsed size in `text` mode. */
  lines?: number;
  /** Collapsed size in `rich` mode. */
  collapsedHeight?: number;
  moreLabel?: string;
  lessLabel?: string;
  /** Names what is being expanded, for a screen reader. */
  describes?: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  /* Whether anything is actually hidden. Measured from the rendered element
   * rather than guessed from a character count: the answer depends on the
   * column width, the font and the viewport, so a count that looks right in a
   * desktop grid offers "Read more" on a phone for copy that already fits. */
  const [overflows, setOverflows] = useState(false);
  const body = useRef<HTMLDivElement>(null);

  const text = mode === 'text' ? richTextToPlainText(value ?? '') : '';
  const hasContent = mode === 'text' ? Boolean(text) : Boolean(value?.trim());

  useEffect(() => {
    const element = body.current;
    /* Only ever measured while collapsed. Expanded, the element is exactly as
     * tall as its content by definition, so measuring there would conclude it
     * fits and take away the control that collapses it again. */
    if (!element || expanded || !hasContent) return;
    const measure = () =>
      setOverflows(element.scrollHeight - element.clientHeight > 1);
    measure();
    /* Web fonts land after first paint and change how many lines the copy
     * takes, so a block measured too early can be judged to fit and then not. */
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    void fonts?.ready?.then(measure).catch(() => undefined);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [value, expanded, lines, collapsedHeight, mode, hasContent]);

  if (!hasContent) return null;

  /* `has-more` is what carries the fade, so the fade can never appear on copy
   * that is already whole. */
  const state = expanded
    ? 'is-open'
    : `is-collapsed${overflows ? ' has-more' : ''}`;

  return (
    <div className={`disclosure${className ? ` ${className}` : ''}`}>
      <div
        ref={body}
        className={`disclosure-body disclosure-${mode} ${state}`}
        style={
          expanded
            ? undefined
            : mode === 'text'
              ? ({ '--desc-lines': lines } as React.CSSProperties)
              : { maxHeight: collapsedHeight }
        }
      >
        {mode === 'text' ? text : <RichText value={value ?? ''} />}
      </div>
      {overflows ? (
        <button
          type="button"
          className="disclosure-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? lessLabel : moreLabel}
          {describes ? <span className="sr-only"> of {describes}</span> : null}
        </button>
      ) : null}
    </div>
  );
}
