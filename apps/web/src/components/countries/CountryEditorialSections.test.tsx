import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CountryEditorialSections } from './CountryEditorialSections';

describe('CountryEditorialSections', () => {
  it('resolves only the current country scoped variables in editorial content', () => {
    const html = renderToStaticMarkup(
      <CountryEditorialSections
        variables={{ countryName: 'Canada', countrySlug: 'canada' }}
        sections={[
          {
            id: 'section-1', sectionKey: 'why-study', sectionType: 'RICH_TEXT',
            eyebrow: null, heading: 'Study in {countryName}', subheading: null,
            bodyJson: { paragraphs: ['Explore {countryName} at /countries/{countrySlug}.'] },
            primaryMedia: null, secondaryMedia: null, ctaLabel: null, ctaUrl: null,
            configurationJson: null, displayOrder: 0, status: 'ACTIVE',
            createdAt: '', updatedAt: '',
          },
        ]}
      />,
    );
    expect(html).toContain('Study in Canada');
    expect(html).toContain('Explore Canada at /countries/canada.');
    expect(html).not.toContain('{countryName}');
    expect(html).not.toContain('{countrySlug}');
  });

  /**
   * The caption under a published image, and a card's or step's supporting
   * copy, are authored in the Admin WYSIWYG. They used to be printed as plain
   * text, so an author's bold or bulleted list arrived on the page as literal
   * angle brackets -- or, worse, was simply refused on save.
   */
  const section = (overrides: Record<string, unknown>) => ({
    id: 'section-1', sectionKey: 'guides', sectionType: 'RICH_TEXT',
    eyebrow: null, heading: 'Guidance', subheading: null, bodyJson: {},
    primaryMedia: null, secondaryMedia: null, ctaLabel: null, ctaUrl: null,
    configurationJson: null, displayOrder: 0, status: 'ACTIVE',
    createdAt: '', updatedAt: '',
    ...overrides,
  });

  it('renders a media caption as rich text', () => {
    const html = renderToStaticMarkup(
      <CountryEditorialSections
        variables={{ countryName: 'Canada', countrySlug: 'canada' }}
        sections={[
          section({
            sectionKey: 'media-block',
            sectionType: 'MEDIA',
            bodyJson: { caption: '<p>Campus in <strong>{countryName}</strong>.</p>' },
          }),
        ]}
      />,
    );

    expect(html).toContain('<strong>Canada</strong>');
    expect(html).not.toContain('&lt;strong&gt;');
  });

  it('renders card and step descriptions as rich text', () => {
    const html = renderToStaticMarkup(
      <CountryEditorialSections
        variables={{ countryName: 'Canada', countrySlug: 'canada' }}
        sections={[
          section({
            sectionKey: 'cities',
            sectionType: 'CARD_GRID',
            bodyJson: { items: [{ title: 'Toronto', description: '<ul><li>Largest city</li></ul>' }] },
          }),
          section({
            id: 'section-2',
            sectionKey: 'application-steps',
            sectionType: 'STEPS',
            bodyJson: { items: [{ step: '01', title: 'Apply', description: '<p>Submit <em>early</em>.</p>' }] },
          }),
        ]}
      />,
    );

    expect(html).toContain('<li>Largest city</li>');
    expect(html).toContain('<em>early</em>');
  });

  it('still renders a description that was stored as plain text', () => {
    const html = renderToStaticMarkup(
      <CountryEditorialSections
        variables={{ countryName: 'Canada', countrySlug: 'canada' }}
        sections={[
          section({
            sectionKey: 'cities',
            sectionType: 'CARD_GRID',
            bodyJson: { items: [{ title: 'Toronto', description: 'Largest city in {countryName}.' }] },
          }),
        ]}
      />,
    );

    expect(html).toContain('Largest city in Canada.');
    expect(html).not.toContain('&lt;');
  });

  it('drops unsafe markup a stored caption might still carry', () => {
    const html = renderToStaticMarkup(
      <CountryEditorialSections
        variables={{ countryName: 'Canada', countrySlug: 'canada' }}
        sections={[
          section({
            sectionKey: 'media-block',
            sectionType: 'MEDIA',
            bodyJson: { caption: '<p>Campus</p><script>alert(1)</script>' },
          }),
        ]}
      />,
    );

    expect(html).toContain('Campus');
    expect(html).not.toContain('<script');
  });
});
