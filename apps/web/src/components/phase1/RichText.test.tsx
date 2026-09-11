import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RichText, safeRichText } from './RichText';

describe('RichText', () => {
  it('renders allowlisted formatted content and Media Library images', () => {
    const html = renderToStaticMarkup(<RichText value={'<h2>Heading</h2><p><strong>Copy</strong></p><img src="/api/v1/media/demo.webp" alt="Demo">'} />);
    expect(html).toContain('<h2>Heading</h2>');
    expect(html).toContain('/api/v1/media/demo.webp');
  });

  it('removes executable tags, handlers, unsafe links, and base64 images', () => {
    const safe = safeRichText('<script>alert(1)</script><p onclick="bad()">Safe</p><a href="javascript:bad()">No</a><img src="data:image/png;base64,x">');
    expect(safe).toContain('<p>Safe</p>');
    expect(safe).not.toContain('alert(1)');
    expect(safe).not.toContain('onclick');
    expect(safe).not.toContain('javascript:');
    expect(safe).not.toContain('<img');
  });

  it('preserves only safe alignment emitted by the shared Admin editor', () => {
    expect(
      safeRichText('<p style="text-align: center; color: red">Aligned</p>'),
    ).toBe('<p style="text-align: center">Aligned</p>');
    expect(safeRichText('<p style="text-align: justify">Nope</p>')).toBe('<p>Nope</p>');
  });
});

/**
 * The Admin rich-text editor's `%` autocomplete inserts an entity as an
 * internal link. That link is only worth inserting if it survives every
 * sanitiser between the editor and the page, so the public end of that contract
 * is pinned here as well as in the Admin.
 */
describe('internal entity links from the editor autocomplete', () => {
  it('keeps a root-relative entity link and hardens it', () => {
    const inserted =
      '<p>Partnered with <a href="/universities/indian-institute-of-science" rel="noopener noreferrer">Indian Institute of Science</a>.</p>';

    const rendered = safeRichText(inserted);

    expect(rendered).toContain('href="/universities/indian-institute-of-science"');
    expect(rendered).toContain('rel="noopener noreferrer"');
    expect(rendered).toContain('Indian Institute of Science');
  });

  it('strips an href that only looks root-relative', () => {
    /* `//evil.example` is protocol-relative, not internal. The editor refuses
     * to build one, and the renderer refuses to trust one. */
    expect(safeRichText('<a href="//evil.example">x</a>')).toBe('<a>x</a>');
    expect(safeRichText('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
  });
});
