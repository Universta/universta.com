import { describe, expect, it } from '@jest/globals';
import { publicProfileSummary } from './profile.mappers';

const base = {
  id: 'x',
  countryId: 'country',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('public country profile policy', () => {
  it('omits optional facts when source-backed verification is missing', () => {
    const result = publicProfileSummary({
      costProfile: {
        ...base,
        currencyCode: 'CAD',
        currencySymbol: '$',
        tuitionMin: '1',
        tuitionMax: '2',
        tuitionPeriod: 'PER_YEAR',
        tuitionNotes: null,
        livingCostMin: null,
        livingCostMax: null,
        livingCostPeriod: 'PER_MONTH',
        livingCostNotes: null,
        accommodationMin: null,
        accommodationMax: null,
        foodCostMin: null,
        foodCostMax: null,
        transportCostMin: null,
        transportCostMax: null,
        healthInsuranceCost: null,
        applicationFeeMin: null,
        applicationFeeMax: null,
        budgetBand: 'MID_RANGE',
        applicableYear: 2026,
        sourceReference: null,
        disclaimer: null,
        verifiedAt: null,
      },
      workProfile: null,
      languageRequirements: null,
      intakes: [],
      statistics: {
        ...base,
        universitiesCount: 0,
        coursesCount: 0,
        topRankedUniversitiesCount: 0,
        publicUniversitiesCount: 0,
        privateUniversitiesCount: 0,
        ugCoursesCount: 0,
        pgCoursesCount: 0,
        pgdmCoursesCount: 0,
        mbaCoursesCount: 0,
        phdCoursesCount: 0,
        scholarshipsCount: 0,
        citiesCount: 0,
        internationalStudentsCount: null,
        studentSatisfactionPercentage: null,
        sourceMode: 'MANUAL',
        sourceReference: null,
        verifiedAt: null,
      },
    });
    expect(result.cost).toBeNull();
    expect(result.statistics).toBeNull();
  });

  it('preserves verified zero statistics and only publishes major active intakes', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const result = publicProfileSummary({
      costProfile: null,
      workProfile: null,
      languageRequirements: null,
      intakes: [
        {
          ...base,
          intakeId: 'jan',
          isMajor: false,
          availabilityStatus: 'AVAILABLE',
          applicationOpeningMonth: null,
          applicationDeadlineMonth: null,
          applicationOpeningNote: null,
          applicationDeadlineNote: null,
          notes: null,
          displayOrder: 0,
          intake: {
            id: 'jan',
            name: 'January',
            slug: 'january',
            startMonth: 1,
            endMonth: 1,
            seasonName: 'WINTER',
            shortLabel: 'Jan',
            status: 'ACTIVE',
          },
        },
        {
          ...base,
          intakeId: 'sep',
          isMajor: true,
          availabilityStatus: 'AVAILABLE',
          applicationOpeningMonth: null,
          applicationDeadlineMonth: null,
          applicationOpeningNote: null,
          applicationDeadlineNote: null,
          notes: null,
          displayOrder: 1,
          intake: {
            id: 'sep',
            name: 'September',
            slug: 'september',
            startMonth: 9,
            endMonth: 9,
            seasonName: 'FALL',
            shortLabel: 'Sep',
            status: 'ACTIVE',
          },
        },
      ],
      statistics: {
        ...base,
        universitiesCount: 0,
        coursesCount: 0,
        topRankedUniversitiesCount: 0,
        publicUniversitiesCount: 0,
        privateUniversitiesCount: 0,
        ugCoursesCount: 0,
        pgCoursesCount: 0,
        pgdmCoursesCount: 0,
        mbaCoursesCount: 0,
        phdCoursesCount: 0,
        scholarshipsCount: 0,
        citiesCount: 0,
        internationalStudentsCount: null,
        studentSatisfactionPercentage: null,
        sourceMode: 'MANUAL',
        sourceReference: 'https://example.com/source',
        verifiedAt: now,
      },
    });
    expect(result.intakes).toHaveLength(1);
    expect(result.statistics).toEqual({
      universitiesCount: 0,
      coursesCount: 0,
      topRankedUniversitiesCount: 0,
    });
  });
});

/**
 * The cost card stopped carrying its own currency code and symbol -- they were
 * a second copy that could disagree with the Country's identity section. A cost
 * profile saved since then has none of its own, so without inheritance the
 * public payload published tuition figures with no unit at all.
 */
describe('cost currency inheritance', () => {
  const costProfile = {
    currencyCode: null,
    currencySymbol: null,
    tuitionMin: '7000',
    tuitionMax: '12000',
    tuitionPeriod: 'PER_YEAR',
    budgetBand: 'MID_RANGE',
    sourceMode: 'MANUAL',
    sourceReference: 'https://example.org/cost',
    verifiedAt: new Date('2026-01-02T00:00:00.000Z'),
  } as Record<string, unknown>;

  const bundle = (overrides: Record<string, unknown>) =>
    ({
      costProfile,
      workProfile: null,
      languageRequirements: null,
      intakes: [],
      statistics: null,
      ...overrides,
    }) as never;

  it('falls back to the Country currency when the profile has none', () => {
    const result = publicProfileSummary(
      bundle({ currencyCode: 'EUR', currencySymbol: '€' }),
    );

    expect(result.cost?.currencyCode).toBe('EUR');
    expect(result.cost?.currencySymbol).toBe('€');
  });

  it('keeps a currency the profile does carry', () => {
    const result = publicProfileSummary(
      bundle({
        currencyCode: 'EUR',
        currencySymbol: '€',
        costProfile: {
          ...costProfile,
          currencyCode: 'GBP',
          currencySymbol: '£',
        },
      }),
    );

    expect(result.cost?.currencyCode).toBe('GBP');
    expect(result.cost?.currencySymbol).toBe('£');
  });

  it('publishes null rather than inventing a currency when neither has one', () => {
    const result = publicProfileSummary(bundle({}));

    expect(result.cost?.currencyCode).toBeNull();
    expect(result.cost?.currencySymbol).toBeNull();
  });
});

/**
 * Reading follows the same rule as writing: the fee is printed in the unit the
 * rest of the page says the country uses. Writes derive it from the next save
 * onwards; this is what makes a profile stored before that rule agree too.
 */
describe('visa fee currency inheritance', () => {
  const workProfile = {
    visaFee: '50',
    visaFeeCurrencyCode: null,
    partTimeAllowed: true,
    postStudyWorkAvailable: true,
    sourceReference: 'https://example.org/work',
    verifiedAt: new Date('2026-01-02T00:00:00.000Z'),
  } as Record<string, unknown>;

  const bundle = (overrides: Record<string, unknown>) =>
    ({
      costProfile: null,
      workProfile,
      languageRequirements: null,
      intakes: [],
      statistics: null,
      currencyCode: null,
      currencySymbol: null,
      ...overrides,
    }) as never;

  it('prints the fee in the Country currency', () => {
    expect(
      publicProfileSummary(bundle({ currencyCode: 'EUR' })).work
        ?.visaFeeCurrencyCode,
    ).toBe('EUR');
  });

  it('prefers the Country currency over a stored code that disagrees', () => {
    expect(
      publicProfileSummary(
        bundle({
          currencyCode: 'EUR',
          workProfile: { ...workProfile, visaFeeCurrencyCode: 'QQQ' },
        }),
      ).work?.visaFeeCurrencyCode,
    ).toBe('EUR');
  });

  it('falls back to the stored code while the Country has no currency', () => {
    expect(
      publicProfileSummary(
        bundle({ workProfile: { ...workProfile, visaFeeCurrencyCode: 'GBP' } }),
      ).work?.visaFeeCurrencyCode,
    ).toBe('GBP');
  });
});
