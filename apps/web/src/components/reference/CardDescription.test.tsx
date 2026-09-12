import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CardDescription } from './CardDescription';

/**
 * Short descriptions are authored in the WYSIWYG, so what a listing card
 * receives is markup. The card printed it as text, tags and all:
 *
 *   <p>India is one of the largest higher education systems...</p>
 *
 * appeared on the public listing exactly like that. A card wants readable text,
 * and only as much of it as a card should be tall.
 *
 * Expanding and collapsing is behaviour in a real browser and is covered there,
 * in `apps/admin/e2e/public-countries.spec.ts`. What is pinned here is
 * everything that is true before a single click: what text the card shows, that
 * no markup reaches it, and that it starts clamped.
 */

const AUTHORED =
  '<p>Study in <strong>India</strong>, one of the largest higher education systems in the world.</p><p>Teaching is in English.</p>';

describe('CardDescription', () => {
  it('shows readable text, not the markup it was stored as', () => {
    const html = renderToStaticMarkup(<CardDescription value={AUTHORED} />);
    expect(html).toContain('Study in India');
    expect(html).toContain('Teaching is in English.');
    /* The point of the fix: no tag from the stored value survives into the
     * card, neither rendered nor escaped into visible text. */
    expect(html).not.toContain('&lt;p&gt;');
    expect(html).not.toContain('&lt;strong&gt;');
    expect(html).not.toContain('<strong>');
  });

  it('flattens headings and lists rather than dropping their text', () => {
    const html = renderToStaticMarkup(
      <CardDescription value="<h2>Why India</h2><ul><li>English taught</li><li>Low cost</li></ul>" />,
    );
    expect(html).toContain('Why India');
    expect(html).toContain('English taught');
    expect(html).toContain('Low cost');
    expect(html).not.toContain('&lt;li&gt;');
    expect(html).not.toContain('<li>');
  });

  it('drops markup the sanitiser would never publish', () => {
    /* The flattening runs the stored value through the same sanitiser the
     * detail page uses, so a card is not a way around it. */
    const html = renderToStaticMarkup(
      <CardDescription value={'<p>Safe copy.</p><script>alert(1)</script>'} />,
    );
    expect(html).toContain('Safe copy.');
    expect(html).not.toContain('alert(1)');
    expect(html).not.toContain('script');
  });

  it('renders nothing at all when the record has no description', () => {
    expect(renderToStaticMarkup(<CardDescription value={null} />)).toBe('');
    expect(renderToStaticMarkup(<CardDescription value="" />)).toBe('');
    expect(renderToStaticMarkup(<CardDescription value="<p></p>" />)).toBe('');
  });

  it('starts clamped, at the number of lines the card asked for', () => {
    const html = renderToStaticMarkup(<CardDescription value={AUTHORED} lines={4} />);
    expect(html).toContain('is-clamped');
    expect(html).toContain('--desc-lines:4');
  });

  it('offers no control until the browser reports the text is clipped', () => {
    /* Server-rendered, nothing has been measured yet, so a card must not ship
     * a "See more" that might have nothing behind it. */
    const html = renderToStaticMarkup(<CardDescription value={AUTHORED} />);
    expect(html).not.toContain('See more');
  });
});
