'use client';

import { useEffect, useRef, useState } from 'react';
import { richTextToPlainText } from '../phase1/RichText';

/**
 * A listing card's description.
 *
 * Short descriptions are authored in the WYSIWYG, so what is stored is markup:
 * `<p>India is one of the largest higher education systems...</p>`. A card that
 * printed that string as text printed the tags with it, which is what the
 * public listing was doing. Detail pages render the markup properly through
 * `RichText`; a card wants a readable line or two instead, so this flattens the
 * same sanitised HTML to text through the helper the rest of the site uses
 * rather than stripping tags with a regex of its own.
 *
 * It is then clamped, because a full short description is several paragraphs
 * and a grid of cards each as tall as its longest one is not a grid. The
 * control that lifts the clamp is deliberately small: expanding happens in
 * place, and the card keeps its own separate link to the record.
 */
export function CardDescription({
  value,
  className,
  lines = 5,
  moreLabel = 'See more',
  lessLabel = 'See less',
  describes,
}: {
  /** The stored short description, which may be absent on a record. */
  value: string | null | undefined;
  className?: string;
  /** How many lines the collapsed card shows. */
  lines?: number;
  moreLabel?: string;
  lessLabel?: string;
  /** What the control expands, for a screen reader: "See more about India". */
  describes?: string;
}) {
  const text = richTextToPlainText(value ?? '');
  const [expanded, setExpanded] = useState(false);
  /* Whether the text is actually too long for the collapsed card. Measured
   * rather than guessed from a character count: the answer depends on the
   * card's width, the font and the viewport, so a count that looks right on a
   * desktop grid offers "See more" on a phone for text that already fits. */
  const [overflows, setOverflows] = useState(false);
  const body = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = body.current;
    /* Only ever measured while collapsed. Expanded, the element is exactly as
     * tall as its content by definition, so measuring there would decide the
     * text fits and take away the control that collapses it again. */
    if (!element || expanded) return;
    const measure = () =>
      setOverflows(element.scrollHeight - element.clientHeight > 1);
    measure();
    /* The card is in a responsive grid, so the same text clamps at one width
     * and fits at another. */
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, expanded, lines]);

  if (!text) return null;

  return (
    <div className={`card-desc${className ? ` ${className}` : ''}`}>
      <p
        ref={body}
        className={expanded ? 'card-desc-body' : 'card-desc-body is-clamped'}
        style={expanded ? undefined : ({ '--desc-lines': lines } as React.CSSProperties)}
      >
        {text}
      </p>
      {/* Offered only when there is something more to see. A card whose
        * description already fits gets no control at all. */}
      {overflows ? (
        <button
          type="button"
          className="card-desc-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? lessLabel : moreLabel}
          {describes ? <span className="sr-only"> about {describes}</span> : null}
        </button>
      ) : null}
    </div>
  );
}
