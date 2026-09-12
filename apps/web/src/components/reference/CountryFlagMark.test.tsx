import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CountryFlagMark } from './CountryFlagMark';

/**
 * Every country card jumped straight from an uploaded flag image to the
 * initials of the name, so India published `IN` while the Admin editor beside
 * it showed the flag. Uploading a flag was withdrawn in favour of deriving it
 * from the ISO code; the public payload simply never carried the result.
 *
 * Exactly one of the three marks at a time, in that order of preference.
 */

const INDIA = '\u{1F1EE}\u{1F1F3}';

describe('CountryFlagMark', () => {
  it('shows the derived emoji when the country has one', () => {
    const html = renderToStaticMarkup(
      <CountryFlagMark flag={{ url: null, alt: 'Flag of India', emoji: INDIA }} name="India" />,
    );
    expect(html).toContain(INDIA);
    expect(html).toContain('flag-emoji');
    /* Not both. */
    expect(html).not.toContain('IN<');
    expect(html).not.toContain('<img');
  });

  it('falls back to initials when there is no flag at all', () => {
    const html = renderToStaticMarkup(<CountryFlagMark flag={null} name="India" />);
    expect(html).toBe('IN');
  });

  it('falls back to initials when the ISO code yielded no emoji', () => {
    const html = renderToStaticMarkup(
      <CountryFlagMark flag={{ url: null, alt: 'Flag', emoji: null }} name="South Korea" />,
    );
    expect(html).toBe('SK');
    expect(html).not.toContain('flag-emoji');
  });

  it('prefers an uploaded image over the derived emoji', () => {
    const html = renderToStaticMarkup(
      <CountryFlagMark
        flag={{ url: 'https://cdn.invalid/in.svg', alt: 'Flag of India', emoji: INDIA }}
        name="India"
      />,
    );
    expect(html).toContain('<img');
    expect(html).toContain('https://cdn.invalid/in.svg');
    expect(html).not.toContain(INDIA);
    /* Decorative: the slot is aria-hidden and the country's name is beside it,
     * so the image must not announce the flag a second time. */
    expect(html).toContain('alt=""');
    expect(html).not.toContain('Flag of India');
  });

  it('never shows initials alongside a flag', () => {
    const withEmoji = renderToStaticMarkup(
      <CountryFlagMark flag={{ url: null, alt: '', emoji: INDIA }} name="India" />,
    );
    /* `IN` must not appear as a stray label next to the emoji. */
    expect(withEmoji.replace(INDIA, '')).not.toContain('IN');
  });
});
