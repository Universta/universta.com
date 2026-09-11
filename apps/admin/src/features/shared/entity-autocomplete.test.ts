import { describe, expect, it } from 'vitest';
import {
  buildSuggestions,
  findPercentTrigger,
  suggestionHtml,
  type EntityHit,
} from './entity-autocomplete';

const universities: EntityHit[] = [
  {
    kind: 'university',
    id: 'u-iitd',
    label: 'Indian Institute of Technology Delhi',
    path: '/universities/indian-institute-of-technology-delhi',
    detail: 'University · India',
    related: true,
  },
  {
    kind: 'university',
    id: 'u-iisc',
    label: 'Indian Institute of Science',
    path: '/universities/indian-institute-of-science',
    detail: 'University · India',
    related: true,
  },
  {
    kind: 'university',
    id: 'u-icl',
    label: 'Imperial Ireland College',
    path: '/universities/imperial-ireland-college',
    detail: 'University · Ireland',
    related: false,
  },
];

describe('when the menu opens', () => {
  it('opens on a % that starts a word', () => {
    expect(findPercentTrigger('I love %ii', 10)).toEqual({
      start: 7,
      end: 10,
      query: 'ii',
    });
  });

  it('opens on a bare % so the whole list can be browsed', () => {
    expect(findPercentTrigger('Study in %', 10)).toEqual({
      start: 9,
      end: 10,
      query: '',
    });
  });

  it('opens at the very start of the field', () => {
    expect(findPercentTrigger('%coun', 5)?.query).toBe('coun');
  });
});

describe('when it stays out of the way', () => {
  /* The rule that makes ordinary percentage writing usable. */
  it('does not open for 50% tuition', () => {
    const text = '50% tuition';
    for (let cursor = 1; cursor <= text.length; cursor += 1)
      expect(findPercentTrigger(text, cursor)).toBeNull();
  });

  it('does not open for 100% or 6.5%', () => {
    expect(findPercentTrigger('100%', 4)).toBeNull();
    expect(findPercentTrigger('6.5%', 4)).toBeNull();
    expect(findPercentTrigger('a fee of 25% per year', 13)).toBeNull();
  });

  it('closes once the token is ended by a space or punctuation', () => {
    expect(findPercentTrigger('%country ', 9)).toBeNull();
    expect(findPercentTrigger('%country.', 9)).toBeNull();
    expect(findPercentTrigger('%country, and', 13)).toBeNull();
  });

  it('gives up on a run too long to be a record name', () => {
    expect(findPercentTrigger(`%${'a'.repeat(41)}`, 42)).toBeNull();
  });

  it('ignores a caret that is not after a %', () => {
    expect(findPercentTrigger('plain text', 5)).toBeNull();
  });
});

describe('what the menu offers', () => {
  const variables = [
    { key: 'countryName', label: 'Country name' },
    { key: 'countrySlug', label: 'Country slug' },
  ];

  it('finds entities by the initials people abbreviate them with', () => {
    const results = buildSuggestions({
      query: 'ii',
      variables: [],
      variableValues: {},
      context: 'country',
      entities: universities,
    });

    /* All three match on initials -- "Imperial Ireland College" is iic -- but
     * the two belonging to the country being edited come first, and equal
     * scores fall back to alphabetical so the order never wobbles. */
    expect(results.map((row) => row.label)).toEqual([
      'Indian Institute of Science',
      'Indian Institute of Technology Delhi',
      'Imperial Ireland College',
    ]);
  });

  it('ranks entities belonging to the country being edited above the rest', () => {
    const results = buildSuggestions({
      query: 'i',
      variables: [],
      variableValues: {},
      context: 'country',
      entities: universities,
    });

    expect(results[results.length - 1].label).toBe('Imperial Ireland College');
    expect(results.slice(0, 2).map((row) => row.label)).toContain(
      'Indian Institute of Science',
    );
  });

  it('resolves a country variable from the current form value', () => {
    const results = buildSuggestions({
      query: 'country',
      variables,
      /* No record id yet -- this is what the author has typed into the form. */
      variableValues: { countryName: 'India', countrySlug: 'india' },
      context: 'country',
      entities: [],
    });

    const name = results.find((row) => row.label === 'Country name');
    expect(name?.insertText).toBe('India');
    expect(name?.source).toBe('variable');
  });

  it('keeps a variable dynamic where the public renderer resolves tokens', () => {
    const results = buildSuggestions({
      query: 'course',
      variables: [{ key: 'courseName', label: 'Course name' }],
      variableValues: { courseName: 'MSc Physics' },
      context: 'course',
      entities: [],
    });

    expect(results[0].insertText).toBe('{courseName}');
    expect(results[0].detail).toContain('MSc Physics');
  });

  it('omits a text variable that has no value behind it yet', () => {
    const results = buildSuggestions({
      query: 'country',
      variables,
      variableValues: {},
      context: 'country',
      entities: [],
    });

    expect(results).toEqual([]);
  });
});

describe('what gets inserted', () => {
  it('links an entity that has a public page', () => {
    const [suggestion] = buildSuggestions({
      query: 'technology',
      variables: [],
      variableValues: {},
      entities: universities,
    });

    expect(suggestionHtml(suggestion)).toBe(
      '<a href="/universities/indian-institute-of-technology-delhi" rel="noopener noreferrer">Indian Institute of Technology Delhi</a>',
    );
  });

  it('inserts plain text for an entity with no page of its own', () => {
    const [suggestion] = buildSuggestions({
      query: 'asia',
      variables: [],
      variableValues: {},
      entities: [{ kind: 'continent', id: 'c-asia', label: 'Asia', path: null }],
    });

    expect(suggestionHtml(suggestion)).toBe('Asia');
  });

  it('escapes a name that contains markup characters', () => {
    const [suggestion] = buildSuggestions({
      query: 'rock',
      variables: [],
      variableValues: {},
      entities: [
        { kind: 'university', id: 'x', label: 'Rock & <Roll> College', path: null },
      ],
    });

    expect(suggestionHtml(suggestion)).toBe('Rock &amp; &lt;Roll&gt; College');
  });

  it('refuses to build a link from anything but a root-relative path', () => {
    expect(
      suggestionHtml({
        key: 'k',
        label: 'Evil',
        detail: null,
        insertText: 'Evil',
        insertHref: 'javascript:alert(1)',
        source: 'entity',
      }),
    ).toBe('Evil');
    expect(
      suggestionHtml({
        key: 'k',
        label: 'Offsite',
        detail: null,
        insertText: 'Offsite',
        insertHref: '//evil.example',
        source: 'entity',
      }),
    ).toBe('Offsite');
  });
});
