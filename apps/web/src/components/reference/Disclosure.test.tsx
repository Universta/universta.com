import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Disclosure } from './Disclosure';

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

describe('Disclosure — text mode', () => {
  it('shows readable text, not the markup it was stored as', () => {
    const html = renderToStaticMarkup(<Disclosure mode="text" value={AUTHORED} />);
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
      <Disclosure mode="text" value="<h2>Why India</h2><ul><li>English taught</li><li>Low cost</li></ul>" />,
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
      <Disclosure mode="text" value={'<p>Safe copy.</p><script>alert(1)</script>'} />,
    );
    expect(html).toContain('Safe copy.');
    expect(html).not.toContain('alert(1)');
    expect(html).not.toContain('script');
  });

  it('renders nothing at all when the record has no description', () => {
    expect(renderToStaticMarkup(<Disclosure mode="text" value={null} />)).toBe('');
    expect(renderToStaticMarkup(<Disclosure mode="text" value="" />)).toBe('');
    expect(renderToStaticMarkup(<Disclosure mode="text" value="<p></p>" />)).toBe('');
  });

  it('starts clamped, at the number of lines the card asked for', () => {
    const html = renderToStaticMarkup(<Disclosure mode="text" value={AUTHORED} lines={4} />);
    expect(html).toContain('is-collapsed');
    expect(html).toContain('--desc-lines:4');
  });

  it('offers no control until the browser reports the text is clipped', () => {
    /* Server-rendered, nothing has been measured yet, so a card must not ship
     * a "See more" that might have nothing behind it. */
    const html = renderToStaticMarkup(<Disclosure mode="text" value={AUTHORED} />);
    expect(html).not.toContain('Read more');
  });
});

/**
 * Rich mode keeps the authored formatting and collapses the container instead
 * of the lines, because a line clamp only applies to a single block of text and
 * an overview is several elements deep.
 */
const RICH =
  '<p>Malta teaches in <strong>English</strong>.</p><ul><li>Low tuition</li></ul>';

describe('Disclosure — rich mode', () => {
  it('renders authored markup as formatting, not as text', () => {
    const html = renderToStaticMarkup(<Disclosure value={RICH} />);
    expect(html).toContain('<strong>English</strong>');
    expect(html).toContain('<li>Low tuition</li>');
    expect(html).not.toContain('&lt;strong&gt;');
  });

  it('starts collapsed at the height the caller asked for', () => {
    const html = renderToStaticMarkup(
      <Disclosure value={RICH} collapsedHeight={132} />,
    );
    expect(html).toContain('is-collapsed');
    expect(html).toContain('max-height:132px');
  });

  it('strips markup the sanitiser would never publish', () => {
    const html = renderToStaticMarkup(
      <Disclosure value={'<p>Safe.</p><script>alert(1)</script>'} />,
    );
    expect(html).toContain('Safe.');
    expect(html).not.toContain('alert(1)');
  });

  it('renders nothing for an empty block', () => {
    expect(renderToStaticMarkup(<Disclosure value="" />)).toBe('');
    expect(renderToStaticMarkup(<Disclosure value="   " />)).toBe('');
    expect(renderToStaticMarkup(<Disclosure value={null} />)).toBe('');
  });
});

/**
 * The failure this component was rebuilt around: copy that fits was still being
 * faded out at the bottom, with no control, because the fade was attached to
 * the collapsed state rather than to there actually being more to read.
 */
describe('Disclosure — the fade follows the content, not the state', () => {
  it('does not carry the fade until the browser confirms something is hidden', () => {
    for (const mode of ['text', 'rich'] as const) {
      const html = renderToStaticMarkup(<Disclosure value={RICH} mode={mode} />);
      /* Server-rendered, nothing measured yet: collapsed, but not faded, and
       * offering no control it cannot honour. */
      expect(html).toContain('is-collapsed');
      expect(html).not.toContain('has-more');
      expect(html).not.toContain('Read more');
    }
  });

  it('uses the same control wording and class in both modes', () => {
    const text = renderToStaticMarkup(<Disclosure value={RICH} mode="text" />);
    const rich = renderToStaticMarkup(<Disclosure value={RICH} mode="rich" />);
    expect(text).toContain('disclosure-body disclosure-text');
    expect(rich).toContain('disclosure-body disclosure-rich');
  });
});
