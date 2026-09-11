import type { DynamicVariable } from './variable-autocomplete';

/**
 * The `%` autocomplete's rules, kept out of the editor component so they can be
 * reasoned about and tested without a DOM.
 *
 * Two separate things are offered under one trigger:
 *
 *   a **variable** is the record being edited talking about itself -- `%country`
 *     while editing India. Where the public renderer for that context resolves
 *     `{token}` placeholders, one is inserted and stays dynamic; where it does
 *     not, the current value is inserted as text, because a token it will never
 *     resolve would publish as literal `{countryName}`.
 *   an **entity** is some other record in the catalogue -- a university, a city,
 *     a subject. Its readable name is inserted, as an internal link when that
 *     entity has a public page.
 */

/** Contexts whose routed public page runs `resolveContentVariables`, so a
 * `{token}` left in the text is replaced at render rather than printed.
 *
 * `country` is deliberately absent. The routed Country page is
 * `CountryDetailReference`, which does not resolve tokens -- only the unrouted
 * `CountryPageView` does -- so a Country variable is inserted as text. */
export const DYNAMIC_VARIABLE_CONTEXTS = new Set([
  'university',
  'offering',
  'course',
  'scholarship',
  'consultant',
  'successStory',
]);

export type EntityKind =
  | 'country'
  | 'continent'
  | 'city'
  | 'university'
  | 'subject'
  | 'specialization'
  | 'course'
  | 'scholarship'
  | 'consultant';

export type EntityHit = {
  kind: EntityKind;
  id: string;
  label: string;
  /** Set only where the entity has a public page; absent for continents and
   * specializations, which have no canonical route of their own. */
  path?: string | null;
  /** Why this result is here -- "University · India". Shown, never inserted. */
  detail?: string | null;
  /** True when the entity belongs to the country being edited. */
  related?: boolean;
};

export type Suggestion = {
  key: string;
  label: string;
  detail: string | null;
  /** The text that lands in the document. */
  insertText: string;
  /** When set, the text is inserted as a link to this path. */
  insertHref: string | null;
  source: 'variable' | 'entity';
};

export type Trigger = { start: number; end: number; query: string };

/** The longest `%token` worth treating as a search. Past this the author is
 * writing prose, not picking a record. */
const MAX_QUERY = 40;

/**
 * The `%token` being typed at the caret, or null.
 *
 * The rule that keeps ordinary percentages usable: a `%` directly after a digit
 * or letter is arithmetic, not a trigger. `50% tuition` therefore never opens
 * the menu, and neither does `100%`, while `%ii` at the start of a word does.
 */
export function findPercentTrigger(
  text: string,
  cursor: number,
): Trigger | null {
  if (cursor < 1 || cursor > text.length) return null;
  const before = text.slice(0, cursor);
  const marker = before.lastIndexOf('%');
  if (marker === -1) return null;

  const query = before.slice(marker + 1);
  if (query.length > MAX_QUERY) return null;
  /* A token is one word. A space or punctuation ends it, which is also what
   * dismisses the menu once the author has moved on. */
  if (query && !/^[A-Za-z0-9_-]+$/.test(query)) return null;

  const preceding = marker > 0 ? before[marker - 1] : '';
  /* Start of text, or after whitespace or an opening bracket or quote. Anything
   * alphanumeric before it means this `%` belongs to the word, not to us. */
  if (preceding && !/[\s(["'‘“>]/.test(preceding)) return null;

  return { start: marker, end: cursor, query };
}

/** Case- and separator-insensitive prefix/substring match, ranked so that a
 * prefix hit beats a hit in the middle of a name. */
function score(label: string, query: string): number {
  if (!query) return 1;
  const haystack = label.toLowerCase();
  const needle = query.toLowerCase();
  const index = haystack.indexOf(needle);
  if (index === 0) return 3;
  if (index > 0) return 2;
  /* "%ii" should still find "Indian Institute of Science" -- initials of the
   * words, which is how people abbreviate institution names. */
  const initials = label
    .split(/[\s-]+/)
    .map((word) => word[0]?.toLowerCase() ?? '')
    .join('');
  return initials.includes(needle) ? 2 : 0;
}

/**
 * The menu contents for one keystroke.
 *
 * Variables come first when they match: they are the shortest list, they are
 * about the record in front of the author, and they are what `%country` means.
 * Entities follow, with anything belonging to the country being edited ahead of
 * the rest, then a prefix match ahead of a loose one, then alphabetically so
 * the order never wobbles between identical scores.
 */
export function buildSuggestions({
  query,
  variables,
  variableValues,
  context,
  entities,
  limit = 8,
}: {
  query: string;
  variables: readonly DynamicVariable[];
  /** Current form values by variable key, so `%country` resolves what the
   * author has typed into Country name even before the record has an id. */
  variableValues: Record<string, string | undefined>;
  context?: string;
  entities: readonly EntityHit[];
  limit?: number;
}): Suggestion[] {
  const dynamic = Boolean(context && DYNAMIC_VARIABLE_CONTEXTS.has(context));

  const fromVariables = variables
    .map((variable) => {
      const current = (variableValues[variable.key] ?? '').trim();
      /* A variable with nothing behind it yet would insert an empty string, so
       * it is only offered dynamically -- where the token still means
       * something at render time. */
      if (!dynamic && !current) return null;
      const rank = Math.max(
        score(variable.label, query),
        score(variable.key, query),
      );
      if (!rank) return null;
      return {
        rank,
        suggestion: {
          key: `variable:${variable.key}`,
          label: variable.label,
          detail: dynamic
            ? current
              ? `Updates automatically — currently ${current}`
              : 'Updates automatically'
            : current,
          insertText: dynamic ? `{${variable.key}}` : current,
          insertHref: null,
          source: 'variable' as const,
        },
      };
    })
    .filter((row) => row !== null)
    .sort((a, b) => b.rank - a.rank || a.suggestion.label.localeCompare(b.suggestion.label));

  const fromEntities = entities
    .map((entity) => ({ rank: score(entity.label, query), entity }))
    .filter((row) => row.rank > 0)
    .sort(
      (a, b) =>
        Number(Boolean(b.entity.related)) - Number(Boolean(a.entity.related)) ||
        b.rank - a.rank ||
        a.entity.label.localeCompare(b.entity.label),
    )
    .map(({ entity }) => ({
      key: `entity:${entity.kind}:${entity.id}`,
      label: entity.label,
      detail: entity.detail ?? null,
      insertText: entity.label,
      insertHref: entity.path ?? null,
      source: 'entity' as const,
    }));

  return [...fromVariables.map((row) => row.suggestion), ...fromEntities].slice(
    0,
    limit,
  );
}

const ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};
function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ESCAPE[char] ?? char);
}

/**
 * What a chosen suggestion puts into the document.
 *
 * A link is emitted only for a root-relative path. That is the shape every
 * layer of the rich-text contract already accepts -- the Admin's
 * `sanitizeEditorHtml`, the API's `sanitizeRichText` and the public
 * `safeRichText` all allow `<a href="/...">` and add `rel="noopener
 * noreferrer"` -- so an inserted entity link survives the round trip unchanged
 * instead of being stripped back to bare text on save.
 */
export function suggestionHtml(suggestion: Suggestion): string {
  const text = escapeHtml(suggestion.insertText);
  const href = suggestion.insertHref;
  if (!href || !/^\/(?!\/)/.test(href)) return text;
  return `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${text}</a>`;
}
