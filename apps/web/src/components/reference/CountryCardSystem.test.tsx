import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  CountryDetailReference,
  type CountryDetailReferenceProps,
} from './CountryDetailReference';

/**
 * The destination cards, the "why study here" section and the city cards are
 * one card system, and each of them had a way of turning real data into a bad
 * page:
 *
 *  - a ticked feature carries a label and nothing else, and sixteen of those
 *    rendered as sixteen nineteen-rem cards with a heading and empty space;
 *  - a city's description is stored as authored rich text, and the card
 *    printed its `<p>` tags as literal characters;
 *  - a long city description made one card twice the height of its neighbour.
 *
 * These pin the shapes the data actually takes.
 */

function build(
  overrides: Partial<{
    features: Array<{ code: string; label: string }>;
    cities: unknown[];
    work: Record<string, unknown> | null;
  }> = {},
): CountryDetailReferenceProps {
  return {
    page: {
      country: {
        id: 'c1',
        name: 'India',
        slug: 'india',
        pageHeading: 'Study in India',
        shortDescription: 'Explore universities across India.',
        continent: { id: 'a1', name: 'Asia', slug: 'asia' },
        flag: null,
        featured: false,
        displayOrder: 0,
        configuration: {
          features: overrides.features ?? [],
          acceptedTests: [],
          intakeMonths: [],
        },
      },
      profiles: {
        cost: null,
        work: overrides.work ?? null,
        language: null,
        statistics: null,
        intakes: [],
      },
      sections: [],
      faqs: [],
      seo: null,
      consultantCards: [],
    },
    cities: overrides.cities ?? [],
    universities: [],
    universityTotal: 0,
    scholarships: [],
    scholarshipTotal: 0,
    subjects: [],
    courseTotal: 0,
  } as unknown as CountryDetailReferenceProps;
}

const city = (over: Record<string, unknown> = {}) => ({
  id: 'city-1',
  name: 'New Delhi',
  slug: 'new-delhi',
  shortDescription: '<p>The national capital, and home to central universities.</p>',
  isFeatured: false,
  state: { name: 'Delhi', slug: 'delhi' },
  heroMedia: null,
  ...over,
});

describe('why-study features', () => {
  const features = [
    { code: 'ENGLISH_TAUGHT_DEGREES', label: 'English-taught degrees' },
    { code: 'LOW_TUITION_FEES', label: 'Low tuition fees' },
    { code: 'BUDGET_FRIENDLY', label: 'Budget friendly' },
    { code: 'RESIDENTIAL_CAMPUSES', label: 'Residential campuses' },
  ];

  it('renders a label-only feature as a compact tile, not as a full card', () => {
    const html = renderToStaticMarkup(<CountryDetailReference {...build({ features })} />);
    // Every feature is present...
    for (const feature of features) expect(html).toContain(feature.label);
    // ...as a tile, and not one of them as a card with a reserved body height.
    expect(html).toContain('data-testid="country-feature-tiles"');
    expect(html.split('class="cdx-tile"').length - 1).toBe(features.length);
    expect(html).not.toContain('data-testid="country-why-cards"');
  });

  it('keeps the richer card for a feature that carries copy', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...build({
          features,
          work: {
            postStudyWorkAvailable: true,
            postStudyWorkMinMonths: 24,
            postStudyWorkMaxMonths: 24,
            postStudyWorkSummary: 'Graduates may stay on to work after finishing.',
          },
        })}
      />,
    );
    // Both shapes, each in its own container: tiles for the labels, a card for
    // the summary that actually has something to read.
    expect(html).toContain('data-testid="country-feature-tiles"');
    expect(html).toContain('data-testid="country-why-cards"');
    expect(html).toContain('Graduates may stay on to work after finishing.');
  });

  it('does not render the section at all when nothing was recorded', () => {
    const html = renderToStaticMarkup(<CountryDetailReference {...build()} />);
    expect(html).not.toContain('data-testid="country-feature-tiles"');
    expect(html).not.toContain('data-testid="country-why-cards"');
  });
});

describe('city cards', () => {
  it('shows an authored description as words, never as literal tags', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build({ cities: [city()] })} />,
    );
    expect(html).toContain('The national capital, and home to central universities.');
    // The escaped form is what a reader saw on the page before this.
    expect(html).not.toContain('&lt;p&gt;');
    expect(html).not.toContain('&lt;/p&gt;');
  });

  it('flattens the markup an editor can nest inside a description', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...build({
          cities: [
            city({
              shortDescription:
                '<p>A <strong>coastal</strong> city with a <em>large</em> student population.</p>',
            }),
          ],
        })}
      />,
    );
    expect(html).toContain('A coastal city with a large student population.');
    expect(html).not.toContain('&lt;strong&gt;');
  });

  it('leaves out the image band entirely when the city has no picture', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build({ cities: [city()] })} />,
    );
    // No flat colour panel standing in for an image that does not exist.
    expect(html).not.toContain('city-img');
  });

  it('uses the picture as a band when the city does have one', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...build({
          cities: [city({ heroMedia: { url: 'https://cdn.example.org/delhi.jpg' } })],
        })}
      />,
    );
    expect(html).toContain('city-img');
    expect(html).toContain('https://cdn.example.org/delhi.jpg');
  });

  it('still reads as a finished card when there is no description', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build({ cities: [city({ shortDescription: null })] })} />,
    );
    expect(html).toContain('New Delhi');
    expect(html).toContain('Delhi');
    expect(html).toContain('City guide');
    expect(html).not.toContain('city-sum');
  });

  it('asks for three columns for six cities, so the row is not four and a gap', () => {
    const cities = Array.from({ length: 6 }, (_, index) =>
      city({ id: `city-${index}`, name: `City ${index}`, slug: `city-${index}` }),
    );
    const html = renderToStaticMarkup(<CountryDetailReference {...build({ cities })} />);
    expect(html).toContain('data-cols="3"');
  });

  it('links a city to its guide under the destination, not to a route that 404s', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build({ cities: [city()] })} />,
    );
    expect(html).toContain('href="/study-in/india/new-delhi"');
    expect(html).not.toContain('href="/cities/new-delhi"');
  });
});
