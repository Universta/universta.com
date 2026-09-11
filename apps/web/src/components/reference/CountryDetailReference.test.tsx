import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  CountryDetailReference,
  type CountryDetailReferenceProps,
} from './CountryDetailReference';

/**
 * Every row of the hero "at a glance" panel comes from an Admin-managed
 * profile. On the deployed catalogue none of those profiles were filled in, so
 * all six rows resolved to null and the aside still rendered: a titled card
 * with a subtitle and nothing under it, on all six country pages, with the
 * hero heading stranded at 62% width beside the empty column.
 */

const emptyProfiles = {
  cost: null,
  work: null,
  language: null,
  statistics: null,
  intakes: [],
} as unknown as CountryDetailReferenceProps['page']['profiles'];

function build(
  profiles: CountryDetailReferenceProps['page']['profiles'],
  derived?: unknown,
): CountryDetailReferenceProps {
  return {
    page: {
      country: {
        id: 'c1',
        name: 'United Kingdom',
        slug: 'united-kingdom',
        pageHeading: 'Study in the United Kingdom',
        shortDescription: 'Explore universities across the United Kingdom.',
        continent: { id: 'e1', name: 'Europe', slug: 'europe' },
        flag: null,
        featured: false,
        displayOrder: 0,
        derived,
      },
      profiles,
      sections: [],
      faqs: [],
      seo: null,
      consultantCards: [],
    },
    cities: [],
    universities: [],
    universityTotal: 0,
    scholarships: [],
    scholarshipTotal: 0,
    subjects: [],
    courseTotal: 0,
  } as unknown as CountryDetailReferenceProps;
}

describe('CountryDetailReference hero quick facts', () => {
  it('omits the at-a-glance panel when no figure is published', () => {
    const html = renderToStaticMarkup(<CountryDetailReference {...build(emptyProfiles)} />);
    expect(html).not.toContain('quickfacts');
    expect(html).not.toContain('at a glance');
    // and the hero must not keep an empty second column
    expect(html).toContain('hero-grid-solo');
  });

  it('renders the panel, and no solo modifier, as soon as one figure exists', () => {
    const withCost = {
      ...emptyProfiles,
      cost: { currencyCode: 'GBP', tuitionMin: '20000', tuitionMax: '30000', tuitionPeriod: 'PER_YEAR' },
    } as unknown as CountryDetailReferenceProps['page']['profiles'];
    const html = renderToStaticMarkup(<CountryDetailReference {...build(withCost)} />);
    expect(html).toContain('quickfacts');
    expect(html).toContain('at a glance');
    expect(html).toContain('Tuition');
    expect(html).not.toContain('hero-grid-solo');
  });

  it('uses API-derived institutional facts without requiring duplicate country profiles', () => {
    const derived = {
      averageTuition: {
        amount: '28666.67',
        currencyCode: 'GBP',
        currencySymbol: '£',
        period: 'PER_YEAR',
        offeringCount: 3,
      },
      statistics: {
        universitiesCount: 2,
        publicUniversitiesCount: 2,
        coursesCount: 3,
      },
      topRankedUniversities: [
        {
          id: 'u-top',
          name: 'Acceptance Ranked University',
          slug: 'acceptance-ranked-university',
          institutionType: 'PUBLIC',
          qsRanking: 24,
        },
      ],
      popularUniversities: [
        {
          id: 'u-popular',
          name: 'Acceptance Popular University',
          slug: 'acceptance-popular-university',
          institutionType: 'PUBLIC',
          qsRanking: null,
        },
      ],
      popularCourses: [
        {
          id: 'course-popular',
          name: 'Acceptance Popular Course',
          slug: 'acceptance-popular-course',
          shortDescription: 'A catalogue-backed course card.',
        },
      ],
    };

    const html = renderToStaticMarkup(
      <CountryDetailReference {...build(emptyProfiles, derived)} />,
    );

    expect(html).toContain('Average tuition');
    expect(html).toContain('GBP 28,666.67');
    expect(html).toContain('Universities');
    expect(html).toContain('Public universities');
    expect(html).toContain('Courses');
    expect(html).toContain('Top ranked universities');
    expect(html).toContain('Acceptance Ranked University');
    expect(html).toContain('Popular universities');
    expect(html).toContain('Acceptance Popular University');
    expect(html).toContain('Popular courses');
    expect(html).toContain('Acceptance Popular Course');
    expect(html).not.toContain('hero-grid-solo');
  });
});

/**
 * The country page carries three university blocks -- the published listing,
 * the QS-ranked highlights and the curated picks -- each an independent query
 * over the same published set. On a large catalogue they name different
 * institutions. On Malta, which publishes one university holding a QS position
 * and ticked as popular, all three named it and the page printed the same card
 * three times. Each block now shows only what the blocks above it have not.
 */

const ranked = (name: string, slug: string, qsRanking: number | null) => ({
  id: `ranked-${slug}`,
  name,
  slug,
  institutionType: 'PRIVATE',
  qsRanking,
});

const listed = (name: string, slug: string) => ({
  name,
  slug,
  city: null,
  institutionType: 'PRIVATE',
  verified: false,
});

function buildUniversities(overrides: {
  universities?: ReturnType<typeof listed>[];
  topRankedUniversities?: ReturnType<typeof ranked>[];
  popularUniversities?: ReturnType<typeof ranked>[];
}): CountryDetailReferenceProps {
  const base = build(emptyProfiles, {
    averageTuition: null,
    statistics: null,
    topRankedUniversities: overrides.topRankedUniversities ?? [],
    popularUniversities: overrides.popularUniversities ?? [],
    popularCourses: [],
  });
  const universities = overrides.universities ?? [];
  return {
    ...base,
    universities,
    universityTotal: universities.length,
  } as unknown as CountryDetailReferenceProps;
}

/** Counts rendered cards rather than raw text, so a name appearing in prose
 * cannot mask a duplicated card. */
function profileLinkCount(html: string, slug: string) {
  return html.split(`href="/universities/${slug}"`).length - 1;
}

describe('CountryDetailReference university deduplication', () => {
  it('renders a university present in all three datasets exactly once', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...buildUniversities({
          universities: [listed('Malta Institute of Technology', 'malta-institute-of-technology')],
          topRankedUniversities: [
            ranked('Malta Institute of Technology', 'malta-institute-of-technology', 801),
          ],
          popularUniversities: [
            ranked('Malta Institute of Technology', 'malta-institute-of-technology', 801),
          ],
        })}
      />,
    );

    expect(html.split('Malta Institute of Technology').length - 1).toBe(1);
    expect(profileLinkCount(html, 'malta-institute-of-technology')).toBe(1);
    expect(html).toContain('Universities in United Kingdom');
    expect(html).not.toContain('Top ranked universities');
    expect(html).not.toContain('Popular universities');
  });

  it('keeps the QS ranking on the listing card when the ranked block is suppressed', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...buildUniversities({
          universities: [listed('Malta Institute of Technology', 'malta-institute-of-technology')],
          topRankedUniversities: [
            ranked('Malta Institute of Technology', 'malta-institute-of-technology', 801),
          ],
        })}
      />,
    );

    expect(html).toContain('QS ranking');
    expect(html).toContain('#801');
    expect(html).not.toContain('Top ranked universities');
  });

  it('renders the ranked block for a university missing from the listing', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...buildUniversities({
          universities: [listed('Listed University', 'listed-university')],
          topRankedUniversities: [ranked('Ranked University', 'ranked-university', 12)],
        })}
      />,
    );

    expect(html).toContain('Top ranked universities');
    expect(html).toContain('Ranked University');
    expect(profileLinkCount(html, 'ranked-university')).toBe(1);
    expect(profileLinkCount(html, 'listed-university')).toBe(1);
  });

  it('renders the popular block only for a university not shown further up', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...buildUniversities({
          universities: [listed('Listed University', 'listed-university')],
          topRankedUniversities: [ranked('Ranked University', 'ranked-university', 12)],
          popularUniversities: [
            ranked('Listed University', 'listed-university', null),
            ranked('Ranked University', 'ranked-university', 12),
            ranked('Popular University', 'popular-university', null),
          ],
        })}
      />,
    );

    expect(html).toContain('Popular universities');
    expect(html).toContain('Popular University');
    for (const slug of ['listed-university', 'ranked-university', 'popular-university'])
      expect(profileLinkCount(html, slug)).toBe(1);
  });

  it('hides both headings when every highlight duplicates the listing', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...buildUniversities({
          universities: [listed('Listed University', 'listed-university')],
          topRankedUniversities: [ranked('Listed University', 'listed-university', 12)],
          popularUniversities: [ranked('Listed University', 'listed-university', 12)],
        })}
      />,
    );

    expect(html).not.toContain('Top ranked universities');
    expect(html).not.toContain('Popular universities');
    expect(profileLinkCount(html, 'listed-university')).toBe(1);
  });

  it('leaves no university card duplicated across the whole section', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...buildUniversities({
          universities: [listed('Alpha University', 'alpha'), listed('Beta University', 'beta')],
          topRankedUniversities: [
            ranked('Alpha University', 'alpha', 5),
            ranked('Gamma University', 'gamma', 9),
          ],
          popularUniversities: [
            ranked('Beta University', 'beta', null),
            ranked('Gamma University', 'gamma', 9),
            ranked('Delta University', 'delta', null),
          ],
        })}
      />,
    );

    for (const slug of ['alpha', 'beta', 'gamma', 'delta'])
      expect(profileLinkCount(html, slug)).toBe(1);
    /* Alpha's ranking survives on its listing card even though its ranked
     * duplicate was dropped. */
    expect(html).toContain('#5');
  });
});

/**
 * Country descriptive fields are authored in a WYSIWYG and stored as sanitised
 * HTML. Several were rendered through plain-text JSX, so a heading or a list an
 * editor had written printed its own tags on the page. These assert the whole
 * chain for one representative field per profile category: stored HTML in,
 * formatting out, never literal markup -- and that legacy plain text, which is
 * most of the existing data, still renders unchanged.
 */

const RICH = {
  bold: '<p>Tuition is <strong>fixed</strong> for the full course.</p>',
  heading: '<h3>Living costs</h3><p>Shared housing in Msida.</p>',
  list: '<ul><li>Bank statement</li><li>Sponsor letter</li></ul>',
  link: '<p>See the <a href="https://example.org/visa">official guidance</a>.</p>',
  unsafe: '<p>Safe</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>',
};

function withProfiles(profiles: Record<string, unknown>): CountryDetailReferenceProps {
  return build({
    cost: null,
    work: null,
    language: null,
    statistics: null,
    intakes: [],
    ...profiles,
  } as unknown as CountryDetailReferenceProps['page']['profiles']);
}

/** Anything the sanitiser kept must arrive as an element, never as text. */
function expectNoLiteralMarkup(html: string) {
  expect(html).not.toMatch(/&lt;(p|strong|h3|ul|li|a|em)\b/i);
}

describe('CountryDetailReference rich-text rendering', () => {
  it('renders cost notes and the cost disclaimer as formatting, not as tags', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          cost: {
            currencyCode: 'EUR',
            tuitionMin: '7000',
            tuitionMax: '12000',
            tuitionPeriod: 'PER_YEAR',
            tuitionNotes: RICH.bold,
            livingCostNotes: RICH.heading,
            disclaimer: RICH.list,
          },
        })}
      />,
    );

    expect(html).toContain('<strong>fixed</strong>');
    expect(html).toContain('<h3>Living costs</h3>');
    expect(html).toContain('<li>Bank statement</li>');
    expectNoLiteralMarkup(html);
  });

  it('renders work summaries and the work disclaimer as formatting', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          work: {
            partTimeAllowed: true,
            partTimeSummary: RICH.bold,
            postStudyWorkAvailable: true,
            postStudyWorkMinMonths: 12,
            postStudyWorkSummary: RICH.list,
            immigrationPathwayStrength: 'STRONG',
            immigrationPathwaySummary: RICH.heading,
            visaInformation: RICH.link,
            disclaimer: RICH.bold,
          },
        })}
      />,
    );

    expect(html).toContain('<li>Bank statement</li>');
    expect(html).toContain('<h3>Living costs</h3>');
    expect(html).toContain('href="https://example.org/visa"');
    expectNoLiteralMarkup(html);
  });

  it('flattens an authored summary that lands in a fact row', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          work: { visaType: 'Type D', proofOfFundsSummary: RICH.list },
        })}
      />,
    );

    /* A table cell, so the markup is flattened rather than rendered -- but the
     * words still arrive and no tag is printed. */
    expect(html).toContain('Bank statement');
    expect(html).not.toContain('<li>Bank statement</li>');
    expectNoLiteralMarkup(html);
  });

  it('renders language notes, waiver notes and the language disclaimer', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          language: {
            ieltsRequirement: 'REQUIRED',
            ieltsMinScore: '6.5',
            generalNotes: RICH.heading,
            languageWaiverAvailable: true,
            waiverNotes: RICH.bold,
            disclaimer: RICH.list,
          },
        })}
      />,
    );

    expect(html).toContain('<h3>Living costs</h3>');
    expect(html).toContain('<strong>fixed</strong>');
    expect(html).toContain('<li>Bank statement</li>');
    // The fixed sentence and the authored note stay separate blocks.
    expect(html).toContain('A waiver is available for some applicants.');
    expectNoLiteralMarkup(html);
  });

  it('renders FAQ answers and consultant card copy as formatting', () => {
    const base = withProfiles({});
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...({
          ...base,
          page: {
            ...base.page,
            faqs: [{ id: 'f1', question: 'Do I need IELTS?', answer: RICH.link, displayOrder: 0 }],
            consultantCards: [
              {
                id: 'c1',
                title: 'Talk to a counsellor',
                shortDescription: RICH.bold,
                isFreeConsultation: true,
                ctaLabel: 'Book',
                ctaUrl: '/consultants',
              },
            ],
          },
        } as unknown as CountryDetailReferenceProps)}
      />,
    );

    expect(html).toContain('href="https://example.org/visa"');
    expect(html).toContain('<strong>fixed</strong>');
    expectNoLiteralMarkup(html);
  });

  it('leaves legacy plain text exactly as it reads today', () => {
    const legacy = 'Tuition is fixed for the full course.';
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          cost: { currencyCode: 'EUR', tuitionMin: '7000', tuitionNotes: legacy },
        })}
      />,
    );

    expect(html).toContain(legacy);
    expect(html).not.toContain('<strong>');
    expectNoLiteralMarkup(html);
  });

  it('still strips unsafe markup once it renders as HTML', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          cost: { currencyCode: 'EUR', tuitionMin: '7000', tuitionNotes: RICH.unsafe },
        })}
      />,
    );

    expect(html).toContain('Safe');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
  });
});

/**
 * Five WYSIWYG-backed fields were stored and editable but reached no public
 * renderer at all: the consultant card's longer overview, and the per-test
 * notes for IELTS, TOEFL, PTE and Duolingo. An operator writing "band minimums
 * apply" against TOEFL was writing to nobody.
 */
describe('CountryDetailReference previously unrendered fields', () => {
  const language = {
    ieltsRequirement: 'REQUIRED',
    ieltsMinScore: '6.5',
    ieltsNotes: '<p>No band below <strong>6.0</strong>.</p>',
    toeflRequirement: 'OPTIONAL',
    toeflMinScore: '88',
    toeflNotes: '<p>Home edition <em>accepted</em>.</p>',
    pteRequirement: 'OPTIONAL',
    pteMinScore: '62',
    pteNotes: '<ul><li>Academic only</li></ul>',
    duolingoRequirement: 'OPTIONAL',
    duolingoMinScore: '115',
    duolingoNotes: '<p>Reviewed <strong>case by case</strong>.</p>',
  };

  it('renders every per-test note as formatting, against its own test', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...withProfiles({ language })} />,
    );

    expect(html).toContain('<strong>6.0</strong>');
    expect(html).toContain('<em>accepted</em>');
    expect(html).toContain('<li>Academic only</li>');
    expect(html).toContain('<strong>case by case</strong>');
    expectNoLiteralMarkup(html);
  });

  it('renders a test note only for the test that has one', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          language: {
            ieltsRequirement: 'REQUIRED',
            ieltsMinScore: '6.5',
            ieltsNotes: '<p>Only IELTS has a note.</p>',
            toeflRequirement: 'OPTIONAL',
            toeflMinScore: '88',
          },
        })}
      />,
    );

    expect(html).toContain('Only IELTS has a note.');
    // One note in, one note out -- no empty note blocks for the other tests.
    expect(html.split('test-note').length - 1).toBe(1);
  });

  it('renders the consultant card overview under its blurb', () => {
    const base = withProfiles({});
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...({
          ...base,
          page: {
            ...base.page,
            consultantCards: [
              {
                id: 'c1',
                title: 'Talk to a counsellor',
                shortDescription: '<p>Free 30-minute session.</p>',
                overview: '<h3>What we cover</h3><ul><li>Course choice</li></ul>',
                isFreeConsultation: true,
                ctaLabel: 'Book',
                ctaUrl: '/consultants',
              },
            ],
          },
        } as unknown as CountryDetailReferenceProps)}
      />,
    );

    expect(html).toContain('Free 30-minute session.');
    expect(html).toContain('<h3>What we cover</h3>');
    expect(html).toContain('<li>Course choice</li>');
    expectNoLiteralMarkup(html);
  });

  it('renders no overview block for a card that has none', () => {
    const base = withProfiles({});
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...({
          ...base,
          page: {
            ...base.page,
            consultantCards: [
              {
                id: 'c1',
                title: 'Talk to a counsellor',
                shortDescription: 'Plain blurb.',
                overview: null,
                isFreeConsultation: false,
                ctaLabel: 'Book',
                ctaUrl: '/consultants',
              },
            ],
          },
        } as unknown as CountryDetailReferenceProps)}
      />,
    );

    expect(html).toContain('Plain blurb.');
    expect(html).not.toContain('cons-overview');
  });

  it('keeps legacy plain notes and strips unsafe note markup', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withProfiles({
          language: {
            ieltsRequirement: 'REQUIRED',
            ieltsNotes: 'No band below 6.0.',
            toeflRequirement: 'OPTIONAL',
            toeflNotes: '<p>ok</p><script>alert(1)</script>',
          },
        })}
      />,
    );

    expect(html).toContain('No band below 6.0.');
    expect(html).toContain('ok');
    expect(html).not.toContain('<script');
    expectNoLiteralMarkup(html);
  });
});

/**
 * The CMS rule end to end, on the surface that matters: a country carrying
 * nothing but a name still has to render a page. The admin browser test covers
 * the same ground, but it cannot run against the restored production-copy
 * database, so the public half is pinned here where it does run.
 */
describe('CountryDetailReference name-only country', () => {
  function nameOnly(): CountryDetailReferenceProps {
    const base = withProfiles({});
    return {
      ...base,
      page: {
        ...base.page,
        country: {
          ...base.page.country,
          name: 'Malta Test Local',
          slug: 'malta-test-local',
          pageHeading: null,
          shortDescription: null,
          continent: null,
          overview: null,
          tagline: null,
        },
      },
    } as unknown as CountryDetailReferenceProps;
  }

  it('renders with no continent, heading, description, ISO or currency', () => {
    const html = renderToStaticMarkup(<CountryDetailReference {...nameOnly()} />);

    // The name carries the page when no heading was written.
    expect(html).toContain('Malta Test Local');
    expect(html).toContain('<h1>Malta Test Local</h1>');
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('null');
  });

  it('renders no empty lede where a short description would go', () => {
    const html = renderToStaticMarkup(<CountryDetailReference {...nameOnly()} />);
    expect(html).not.toContain('class="lede"');
  });
});

/**
 * What the Country editor can publish, and what this page used to show of it.
 *
 * The section list was a hard-coded four keys read only as `paragraphs`, so a
 * section filed under any other key, or authored as a fact grid, a set of
 * steps, a card grid or a call to action, arrived in the payload and was
 * dropped in silence. On the destination this was reported against that was
 * five of seven sections. The bodies below are the exact shapes the Admin
 * editor writes for each of the six section types.
 */
function section(
  sectionKey: string,
  sectionType: string,
  bodyJson: Record<string, unknown>,
  extra: Record<string, unknown> = {},
) {
  return {
    id: `s-${sectionKey}`,
    sectionKey,
    sectionType,
    eyebrow: null,
    heading: `Heading for ${sectionKey}`,
    subheading: null,
    bodyJson,
    primaryMedia: null,
    secondaryMedia: null,
    ctaLabel: null,
    ctaUrl: null,
    configurationJson: null,
    displayOrder: 0,
    status: 'ACTIVE',
    createdAt: '2026-09-11T00:00:00.000Z',
    updatedAt: '2026-09-11T00:00:00.000Z',
    ...extra,
  };
}

function withSections(sections: unknown[]): CountryDetailReferenceProps {
  const base = build(emptyProfiles);
  return {
    ...base,
    page: { ...base.page, sections: sections as never },
  };
}

describe('CountryDetailReference editorial sections', () => {
  it('renders every authored section, whatever its key and body type', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withSections([
          section('why-study', 'RICH_TEXT', {
            paragraphs: ['<p>Teaching is in English.</p>'],
          }),
          section('cost-of-study', 'FACT_GRID', {
            items: [{ label: 'Currency', value: 'Indian Rupee' }],
          }),
          section('application-steps', 'STEPS', {
            items: [
              {
                step: '1',
                title: 'Shortlist programmes',
                description: '<p>Read the credit structure.</p>',
              },
            ],
          }),
          section('student-life', 'CARD_GRID', {
            items: [
              {
                title: 'Hostels are the default',
                description: '<p>Most students live on campus.</p>',
              },
            ],
          }),
          section('choosing-a-university', 'RICH_TEXT', {
            paragraphs: ['<p>Start with the department.</p>'],
          }),
          section('after-you-graduate', 'CTA', {
            supportingText: '<p>Plan the degree and what follows together.</p>',
          }),
          section('a-key-nobody-predefined', 'MEDIA', {
            caption: '<p>A caption the author wrote.</p>',
          }),
        ])}
      />,
    );

    /* The two keys the old allow-list happened to cover. */
    expect(html).toContain('Teaching is in English.');
    expect(html).toContain('Start with the department.');
    /* The five it dropped: a fact grid, steps, cards, a call to action and a
     * key that was never in the list at all. */
    expect(html).toContain('Indian Rupee');
    expect(html).toContain('Shortlist programmes');
    expect(html).toContain('Hostels are the default');
    expect(html).toContain('Plan the degree and what follows together.');
    expect(html).toContain('A caption the author wrote.');
    expect(html).toContain('id="country-a-key-nobody-predefined"');
  });

  it('prints a section call to action when the author gave it one', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withSections([
          section(
            'after-you-graduate',
            'CTA',
            { supportingText: '<p>Talk it through first.</p>' },
            { ctaLabel: 'Speak to an adviser', ctaUrl: '/consultants' },
          ),
        ])}
      />,
    );
    expect(html).toContain('Speak to an adviser');
    expect(html).toContain('href="/consultants"');
  });

  it('leaves out a section whose body the author never filled in', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference
        {...withSections([section('why-study', 'RICH_TEXT', { paragraphs: [] })])}
      />,
    );
    expect(html).not.toContain('id="country-why-study"');
  });
});

/**
 * Cost guidance is prose as often as it is figures. A destination that declines
 * to publish a tuition range -- the honest choice where the range would be
 * invented -- still has something to say about what drives the cost, and the
 * section was gated on the figures alone, so none of it was published.
 */
describe('CountryDetailReference cost section', () => {
  const costProse = {
    cost: {
      currencyCode: 'INR',
      tuitionNotes: '<p>Government-funded institutions charge least.</p>',
      livingCostNotes: '<p>A hostel room is the cheapest way to live.</p>',
      disclaimer: '<p>Confirm fees with the institution.</p>',
    },
    work: null,
    language: null,
    statistics: null,
    intakes: [],
  } as unknown as CountryDetailReferenceProps['page']['profiles'];

  it('publishes the notes when no numeric range was entered', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build(costProse)} />,
    );
    expect(html).toContain('id="cost"');
    expect(html).toContain('Government-funded institutions charge least.');
    expect(html).toContain('A hostel room is the cheapest way to live.');
    expect(html).toContain('Confirm fees with the institution.');
  });

  it('leaves out the empty range table when there are no figures', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build(costProse)} />,
    );
    /* The table header would otherwise print above no rows at all. */
    expect(html).not.toContain('Range</span>');
  });

  it('still omits the section when there is neither a figure nor a note', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build(emptyProfiles)} />,
    );
    expect(html).not.toContain('id="cost"');
  });
});

/**
 * Work guidance whose own answer is "no".
 *
 * The part-time and post-study summaries were rendered only inside highlight
 * cards that require the right to exist. A destination that permits neither --
 * and explains why at length, because that is exactly what a student needs to
 * read -- published none of it.
 */
describe('CountryDetailReference work guidance', () => {
  const restrictive = {
    cost: null,
    work: {
      partTimeAllowed: false,
      postStudyWorkAvailable: false,
      partTimeSummary: '<p>The student visa is granted for study alone.</p>',
      postStudyWorkSummary: '<p>There is no general post-study work visa.</p>',
      immigrationPathwaySummary: '<p>Settlement routes are narrow.</p>',
      immigrationPathwayStrength: 'LIMITED',
    },
    language: null,
    statistics: null,
    intakes: [],
  } as unknown as CountryDetailReferenceProps['page']['profiles'];

  it('publishes the summaries even where the answer is no', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build(restrictive)} />,
    );
    expect(html).toContain('id="visa"');
    expect(html).toContain('The student visa is granted for study alone.');
    expect(html).toContain('There is no general post-study work visa.');
  });

  it('does not turn a restriction into a positive claim', () => {
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build(restrictive)} />,
    );
    /* The highlight cards assert a right exists. Neither may appear here. */
    expect(html).not.toContain('Work while you study');
    expect(html).not.toContain('Post-study work rights');
  });

  it('does not print a summary twice when a card already used it', () => {
    const permissive = {
      ...(restrictive as unknown as Record<string, unknown>),
      work: {
        partTimeAllowed: true,
        partTimeSummary: '<p>Twenty hours a week in term time.</p>',
        partTimeHoursPerWeek: '20',
      },
    } as unknown as CountryDetailReferenceProps['page']['profiles'];
    const html = renderToStaticMarkup(
      <CountryDetailReference {...build(permissive)} />,
    );
    expect(html).toContain('Work while you study');
    expect(
      html.split('Twenty hours a week in term time.').length - 1,
    ).toBe(1);
  });
});
