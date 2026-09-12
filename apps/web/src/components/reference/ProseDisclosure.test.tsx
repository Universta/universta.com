import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProseDisclosure } from './ProseDisclosure';

/**
 * The country page carries several thousand characters of authored prose per
 * section. Collapsing it is presentation, so the markup has to survive: a card
 * flattens its description to text, but an overview keeps its paragraphs and
 * lists. That is why this collapses the container rather than clamping lines.
 */
const RICH =
  '<p>India teaches in <strong>English</strong>.</p><ul><li>Low tuition</li></ul>';

describe('ProseDisclosure', () => {
  it('renders authored markup as formatting, not as text', () => {
    const html = renderToStaticMarkup(<ProseDisclosure value={RICH} />);
    expect(html).toContain('<strong>English</strong>');
    expect(html).toContain('<li>Low tuition</li>');
    expect(html).not.toContain('&lt;strong&gt;');
  });

  it('starts collapsed at the height the caller asked for', () => {
    const html = renderToStaticMarkup(
      <ProseDisclosure value={RICH} collapsedHeight={132} />,
    );
    expect(html).toContain('is-collapsed');
    expect(html).toContain('max-height:132px');
  });

  it('offers no control until the browser reports the block is clipped', () => {
    /* Server-rendered, nothing has been measured, so a block must not ship a
     * control that might have nothing behind it. */
    const html = renderToStaticMarkup(<ProseDisclosure value={RICH} />);
    expect(html).not.toContain('Read more');
  });

  it('renders nothing for an empty or absent block', () => {
    expect(renderToStaticMarkup(<ProseDisclosure value="" />)).toBe('');
    expect(renderToStaticMarkup(<ProseDisclosure value="   " />)).toBe('');
  });

  it('strips markup the sanitiser would never publish', () => {
    const html = renderToStaticMarkup(
      <ProseDisclosure value={'<p>Safe.</p><script>alert(1)</script>'} />,
    );
    expect(html).toContain('Safe.');
    expect(html).not.toContain('alert(1)');
  });
});
