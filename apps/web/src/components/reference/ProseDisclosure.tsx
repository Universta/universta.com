'use client';

import { useEffect, useRef, useState } from 'react';
import { RichText } from '../phase1/RichText';

/**
 * A long authored prose block, collapsed to a readable opening.
 *
 * The card version of this flattens markup to text, which is right for a card
 * and wrong here: an overview keeps its paragraphs, lists and emphasis. So the
 * markup is rendered as it always was and the *container* is what collapses --
 * a height limit rather than a line clamp, because a line clamp only applies to
 * a single block of text and these are several elements deep.
 *
 * Whether to offer the control is measured from the rendered block rather than
 * guessed from a character count, so a country that authored three sentences
 * gets no control and one that authored nine thousand characters does.
 */
export function ProseDisclosure({
  value,
  collapsedHeight = 260,
  moreLabel = 'Read more',
  lessLabel = 'Read less',
  describes,
}: {
  value: string;
  /** How much of the block a reader sees before choosing to go on. */
  collapsedHeight?: number;
  moreLabel?: string;
  lessLabel?: string;
  describes?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = body.current;
    /* Measured only while collapsed: expanded, the block is exactly as tall as
     * its content, so measuring there would decide it fits and remove the
     * control that collapses it again. */
    if (!element || expanded) return;
    const measure = () =>
      setOverflows(element.scrollHeight - element.clientHeight > 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [value, expanded, collapsedHeight]);

  if (!value?.trim()) return null;

  return (
    <div className="prose-disclosure">
      <div
        ref={body}
        className={
          expanded ? 'prose-disclosure-body' : 'prose-disclosure-body is-collapsed'
        }
        style={expanded ? undefined : { maxHeight: collapsedHeight }}
      >
        <RichText value={value} />
      </div>
      {overflows ? (
        <button
          type="button"
          className="card-desc-toggle"
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
