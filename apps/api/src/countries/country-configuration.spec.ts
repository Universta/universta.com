import { CountriesService } from './countries.service';
import type { TaxonomySnapshot } from './country-taxonomy.service';

/**
 * What a country is allowed to store as features and accepted English tests.
 *
 * These were checked against two frozen arrays, which is what made adding an
 * option a code change. The check now reads the taxonomy rows at the moment of
 * the write, so an option an operator added a minute ago is accepted -- and a
 * code from nowhere still is not.
 */

type Configuration = {
  featureCodes?: string[];
  acceptedTests?: string[];
};

const snapshot = (features: string[], tests: string[]): TaxonomySnapshot => ({
  features: features.map((code, index) => ({
    code,
    name: code,
    status: 'ACTIVE',
    displayOrder: index,
    isSystem: false,
  })),
  englishTests: [],
  featureLabels: new Map(features.map((code) => [code, code])),
  testLabels: new Map(tests.map((code) => [code, code])),
  featureCodes: new Set(features),
  testCodes: new Set(tests),
});

const configurationData = (dto: Configuration, known: TaxonomySnapshot) =>
  (
    CountriesService.prototype as unknown as {
      configurationData: (
        value: Configuration,
        taxonomy: TaxonomySnapshot,
      ) => Configuration;
    }
  ).configurationData(dto, known);

const featureCodes = (record: unknown, known: TaxonomySnapshot) =>
  (
    CountriesService.prototype as unknown as {
      featureCodes: (value: unknown, taxonomy: TaxonomySnapshot) => string[];
    }
  ).featureCodes(record, known);

describe('country configuration codes', () => {
  const known = snapshot(
    ['BUDGET_FRIENDLY', 'SCHOLARSHIP_FRIENDLY'],
    ['IELTS', 'DUOLINGO'],
  );

  it('stores an option that was added after this code was written', () => {
    const data = configurationData(
      {
        featureCodes: ['SCHOLARSHIP_FRIENDLY'],
        acceptedTests: ['DUOLINGO'],
      },
      known,
    );

    expect(data.featureCodes).toEqual(['SCHOLARSHIP_FRIENDLY']);
    expect(data.acceptedTests).toEqual(['DUOLINGO']);
  });

  it('drops a code the taxonomy does not know, and de-duplicates', () => {
    const data = configurationData(
      {
        featureCodes: ['BUDGET_FRIENDLY', 'BUDGET_FRIENDLY', 'MADE_UP'],
        acceptedTests: ['IELTS', 'NOT_A_TEST'],
      },
      known,
    );

    expect(data.featureCodes).toEqual(['BUDGET_FRIENDLY']);
    expect(data.acceptedTests).toEqual(['IELTS']);
  });

  it('does not confuse the two taxonomies', () => {
    const data = configurationData(
      { featureCodes: ['IELTS'], acceptedTests: ['BUDGET_FRIENDLY'] },
      known,
    );

    expect(data.featureCodes).toEqual([]);
    expect(data.acceptedTests).toEqual([]);
  });

  it('leaves an omitted list alone rather than clearing it', () => {
    expect(configurationData({}, known)).toEqual({});
  });

  it('keeps a stored code whose option was later retired', () => {
    const retired: TaxonomySnapshot = {
      ...known,
      features: [],
      featureCodes: new Set(['BUDGET_FRIENDLY']),
    };

    expect(
      featureCodes({ featureCodes: ['BUDGET_FRIENDLY'] }, retired),
    ).toEqual(['BUDGET_FRIENDLY']);
  });

  it('still derives features from the profiles when none are stored', () => {
    expect(
      featureCodes(
        {
          featureCodes: [],
          workProfile: { partTimeAllowed: true, postStudyWorkAvailable: false },
          languageRequirements: { languageWaiverAvailable: true },
        },
        known,
      ),
    ).toEqual(['PART_TIME_ALLOWED', 'LANGUAGE_WAIVER']);
  });
});
