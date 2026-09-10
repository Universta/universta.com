'use client';

import dynamic from 'next/dynamic';
import type { EditorialMedia } from '@/features/catalog/catalog.types';
import type { DynamicVariable } from './variable-autocomplete';

/**
 * The single rich-text control every Country field uses. Its props are the
 * contract; the editor behind them is Jodit, whose own toolbar and selection
 * handling we use rather than maintaining our own.
 *
 * Jodit touches `window` and `document` at import time, so it is loaded here
 * with SSR switched off. Admin pages render on the server first, and a
 * top-level import would break the build long before anyone typed anything.
 */

const ALLOWED_TAGS = new Set([
  'p', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul',
  'ol', 'li', 'a', 'blockquote', 'hr', 'br', 'img',
]);
const ALIGNED_BLOCK_TAGS = new Set(['p', 'h2', 'h3', 'h4', 'blockquote']);

export type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  allowedVariables?: readonly DynamicVariable[];
  enableImages?: boolean;
  media?: EditorialMedia[];
  minHeight?: string;
  ariaLabel?: string;
  placeholder?: string;
  hideLabel?: boolean;
};

const JoditRichText = dynamic(
  () => import('@/features/shared/JoditRichText').then((module) => module.JoditRichText),
  {
    ssr: false,
    /* The field keeps its height while the editor bundle arrives, so a long
     * form does not jump as each one loads. */
    loading: () => (
      <div className="min-h-36 w-full animate-pulse rounded-xl border border-[#E8ECF3] bg-[#F8FAFC]" />
    ),
  },
);

export function RichTextEditor(props: RichTextEditorProps) {
  return <JoditRichText {...props} />;
}

/**
 * The stored rich-text subset, unchanged across three editors now: it is the
 * contract with the API's `sanitizeRichText` and the public `RichText`
 * renderer, and nothing about swapping editing engines should move it.
 *
 * The editor is configured to emit only these tags, so this is not applied on
 * every keystroke -- doing that would rewrite the value the editor just
 * emitted and reset the caret. It stays exported as the definition of the
 * contract, and as the guard the storage tests assert against.
 */
export function sanitizeEditorHtml(value: string) {
  return value
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?[^>]+>/g, (tag) => {
      const match = tag.match(/^<\s*(\/?)\s*([a-z0-9]+)/i);
      if (!match || !ALLOWED_TAGS.has(match[2].toLowerCase())) return '';

      const closing = match[1] === '/';
      const name = match[2].toLowerCase();
      if (closing) return `</${name}>`;
      if (ALIGNED_BLOCK_TAGS.has(name)) {
        const alignment = safeAlignment(tag);
        return alignment ? `<${name} style="text-align: ${alignment}">` : `<${name}>`;
      }
      if (!['a', 'img'].includes(name)) return `<${name}>`;
      if (name === 'a') {
        const href = tag.match(/\shref\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
        return safeHref(href)
          ? `<a href="${escapeAttribute(href)}" rel="noopener noreferrer">`
          : '<a>';
      }

      const src = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
      const alt = tag.match(/\salt\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
      return safeImageUrl(src)
        ? `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}">`
        : '';
    });
}

function safeHref(value: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(value.trim());
}

function safeImageUrl(value: string) {
  return /^(https?:\/\/|\/)/i.test(value.trim());
}

function escapeAttribute(value: string) {
  return value.replace(
    /[&<>"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char,
  );
}

function safeAlignment(tag: string) {
  const style = tag.match(/\sstyle\s*=\s*["']([^"']+)["']/i)?.[1] ?? '';
  const alignment = style
    .match(/(?:^|;)\s*text-align\s*:\s*(left|center|right)\s*(?:;|$)/i)?.[1]
    ?.toLowerCase();
  return alignment === 'left' || alignment === 'center' || alignment === 'right'
    ? alignment
    : null;
}
