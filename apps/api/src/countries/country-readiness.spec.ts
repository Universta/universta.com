import { CountriesService } from './countries.service';

/**
 * Publish readiness is the rule that decides whether a country can go live.
 * It used to demand ISO alpha-2 and alpha-3, a page heading, a short
 * description and an active continent, so a country somebody had only just
 * named could be saved but never published. Country is a CMS record now: the
 * name is the only thing an author must supply.
 *
 * These reach the private rule directly. The end-to-end path is covered in
 * `test/country-profiles.e2e-spec.ts`, but that suite cannot authenticate
 * against the restored production-copy database, so the rule itself is pinned
 * here where it runs.
 */
type Readiness = Array<{ field: string; code: string; message: string }>;
const readiness = (record: unknown): Readiness =>
  (
    CountriesService.prototype as unknown as {
      readiness: (value: unknown) => Readiness;
    }
  ).readiness(record);

const activeContinent = {
  id: 'c1',
  name: 'Europe',
  slug: 'europe',
  status: 'ACTIVE',
  deletedAt: null,
};

const country = (overrides: Record<string, unknown> = {}) => ({
  name: 'Malta',
  slug: 'malta',
  iso2Code: null,
  iso3Code: null,
  pageHeading: null,
  shortDescription: null,
  continent: activeContinent,
  ...overrides,
});

describe('country publish readiness', () => {
  it('lets a country with nothing but a name publish', () => {
    expect(readiness(country())).toEqual([]);
  });

  it('does not ask for ISO codes, a heading or a description', () => {
    const fields = readiness(
      country({
        iso2Code: null,
        iso3Code: null,
        pageHeading: '',
        shortDescription: '',
      }),
    ).map((issue) => issue.field);

    for (const field of [
      'iso2Code',
      'iso3Code',
      'pageHeading',
      'shortDescription',
    ])
      expect(fields).not.toContain(field);
  });

  it('still refuses a country with no name', () => {
    expect(readiness(country({ name: '   ' }))).toEqual([
      { field: 'name', code: 'REQUIRED', message: 'Name is required' },
    ]);
  });

  it('publishes a country that has no continent at all', () => {
    // Continent is optional now, so its absence is not a blocker.
    expect(readiness(country({ continent: null }))).toEqual([]);
  });

  it('refuses a continent that was chosen and has since been archived', () => {
    /* Optional is not the same as unchecked: publishing under an archived
     * region would strand the country in every public region listing. */
    for (const continent of [
      { ...activeContinent, status: 'INACTIVE' },
      { ...activeContinent, deletedAt: new Date() },
    ])
      expect(
        readiness(country({ continent })).map((issue) => issue.field),
      ).toEqual(['continentId']);
  });
});
