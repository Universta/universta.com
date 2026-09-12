import type { Flag } from '@/lib/countries';

/** The letters a country falls back to when it has no flag at all. */
function initials(value: string) {
  const words = value
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
  if (words.length === 0) return value.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * What goes in a country's flag slot.
 *
 * Three answers in order of preference, and exactly one of them at a time: an
 * uploaded flag image, the flag emoji the API derives from the ISO code, or the
 * initials of the name. Every card used to jump straight from the image to the
 * initials, so India published `IN` while the Admin editor beside it showed the
 * flag -- the emoji was derivable all along and the public payload simply never
 * carried it.
 *
 * One component because the listing card, the A-Z tile and the detail hero all
 * answer this question, and three copies of it drift.
 */
export function CountryFlagMark({
  flag,
  name,
}: {
  flag: Flag | null | undefined;
  name: string;
}) {
  if (flag?.url)
    /* Decorative, deliberately. Every slot this renders into is marked
     * `aria-hidden` and sits directly beside the country's name, so announcing
     * "Flag of India" after "India" is a repetition, not information. The DTO
     * still carries the alt text for anywhere the flag stands on its own. */
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={flag.url} alt="" />;
  if (flag?.emoji)
    /* Sized and centred by `.flag-emoji`: dropped into a slot built for two
     * capital letters, an emoji renders at the label's size and sits on the
     * text baseline rather than in the middle of the tile. */
    return <span className="flag-emoji">{flag.emoji}</span>;
  return <>{initials(name)}</>;
}
