'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '@/features/auth/auth-client';
import type { DynamicVariable } from './variable-autocomplete';
import {
  buildSuggestions,
  findPercentTrigger,
  type EntityHit,
  type Suggestion,
} from './entity-autocomplete';

/**
 * The inline `%` autocomplete's data and keyboard state.
 *
 * The DOM half lives here because it is the same for every field: read the
 * caret, decide whether a `%token` is being typed, fetch matching records, and
 * hand back a list plus the range the chosen one replaces. Nothing in here is
 * Country-specific -- the shared editor owns one implementation and every
 * module gets it.
 */

export type EditorEntityContext = {
  /** The record being edited, used to rank related entities first. Absent on a
   * record that has not been saved yet, which is fine: ranking degrades, the
   * search still works. */
  countryId?: string;
  /** Which variable registry applies, and whether its tokens stay dynamic. */
  variableContext?: string;
  /** Current form values by variable key, so `%country` resolves what is on
   * screen before the record has an id. */
  variableValues?: Record<string, string | undefined>;
};

type ApiRow = {
  kind: EntityHit['kind'];
  id: string;
  label: string;
  path: string | null;
  detail: string | null;
  related: boolean;
};

/** Results are keyed by query, so backspacing through a word re-uses what has
 * already been fetched instead of asking again. Cleared when the field
 * unmounts; a handful of small arrays for the life of one editing session. */
type Cache = Map<string, EntityHit[]>;

const DEBOUNCE_MS = 160;

export function useEntityAutocomplete({
  variables,
  context,
  enabled,
}: {
  variables: readonly DynamicVariable[];
  context?: EditorEntityContext;
  enabled: boolean;
}) {
  const [query, setQuery] = useState<string | null>(null);
  const [entities, setEntities] = useState<EntityHit[]>([]);
  const [active, setActive] = useState(0);
  /** The token the menu is currently open on, tracked outside React state.
   *
   * Caret tracking re-reads the caret on every keyup, so the same token is
   * reported many times while the menu is open. This is what makes reopening
   * on an unchanged token a no-op -- see `openAt` for why that matters. */
  const queryRef = useRef<string | null>(null);
  const cache = useRef<Cache>(new Map());
  const countryId = context?.countryId;

  /* One in-flight request per field. A superseded query's response is dropped
   * rather than allowed to overwrite a newer one -- typing quickly through
   * "%ind" must not end up showing the results for "%i". */
  const requestId = useRef(0);

  useEffect(() => {
    if (!enabled || query === null) return;
    const cached = cache.current.get(query);
    if (cached) {
      setEntities(cached);
      return;
    }
    const ticket = ++requestId.current;
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: query });
      if (countryId) params.set('countryId', countryId);
      void authFetch(`/api/v1/admin/internal-links/entities?${params}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { data?: ApiRow[] } | null) => {
          if (ticket !== requestId.current) return;
          const rows = (body?.data ?? []).map((row) => ({
            kind: row.kind,
            id: row.id,
            label: row.label,
            path: row.path,
            detail: row.detail,
            related: row.related,
          }));
          cache.current.set(query, rows);
          setEntities(rows);
        })
        /* A failed lookup leaves the variable half of the menu working rather
         * than tearing the whole thing down mid-sentence. */
        .catch(() => {
          if (ticket === requestId.current) setEntities([]);
        });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [countryId, enabled, query]);

  const suggestions = useMemo(
    () =>
      query === null
        ? []
        : buildSuggestions({
            query,
            variables,
            variableValues: context?.variableValues ?? {},
            context: context?.variableContext,
            entities,
          }),
    [context?.variableContext, context?.variableValues, entities, query, variables],
  );

  /**
   * Opens the menu on a token, resetting the highlight when the token changes.
   *
   * The reset has to happen outside the `setQuery` updater, and the ref above
   * is what lets it. It was written as `setQuery(current => { if (current !==
   * next) setActive(0); return next })`, which looks equivalent and is not: an
   * updater runs during render and must be pure. React re-invokes a queued
   * updater whenever it reprocesses the queue -- which any other state change
   * triggers, and the caret rescan on every keyup supplies a stream of them --
   * so that `setActive(0)` fired again and again from a stale base state.
   * Pressing ArrowDown moved the highlight and the next rescan put it straight
   * back on the first result, which is exactly what an author saw: the arrow
   * keys did nothing at all.
   *
   * Comparing against the ref instead keeps the whole thing outside render: an
   * unchanged token returns immediately, so a rescan cannot touch the
   * highlight, and a genuinely new token resets it once.
   */
  const openAt = useCallback((next: string) => {
    if (queryRef.current === next) return;
    queryRef.current = next;
    setActive(0);
    setQuery(next);
  }, []);

  const close = useCallback(() => {
    queryRef.current = null;
    setQuery(null);
    setEntities([]);
    setActive(0);
    requestId.current += 1;
  }, []);

  return {
    open: enabled && query !== null && suggestions.length > 0,
    query,
    suggestions,
    active: Math.min(active, Math.max(suggestions.length - 1, 0)),
    setActive,
    setQuery: openAt,
    close,
  };
}

/**
 * The `%token` under the caret, plus the exact DOM range it occupies.
 *
 * Only a caret sitting inside a single text node counts. A selection spanning
 * nodes is the author highlighting something, not typing a token, and trying to
 * rewrite across a boundary is how a rich-text insertion corrupts markup.
 */
export function triggerAtCaret(root: HTMLElement | null): {
  query: string;
  range: Range;
  rect: DOMRect;
} | null {
  if (!root) return null;
  const selection = root.ownerDocument?.getSelection();
  if (!selection || !selection.isCollapsed || selection.rangeCount === 0)
    return null;
  const node = selection.anchorNode;
  if (!node || node.nodeType !== Node.TEXT_NODE) return null;
  if (!root.contains(node)) return null;

  const text = node.textContent ?? '';
  const found = findPercentTrigger(text, selection.anchorOffset);
  if (!found) return null;

  const range = root.ownerDocument.createRange();
  range.setStart(node, found.start);
  range.setEnd(node, found.end);
  return { query: found.query, range, rect: range.getBoundingClientRect() };
}

export type { Suggestion };
