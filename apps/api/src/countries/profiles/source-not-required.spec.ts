import { CountryProfilesService } from './country-profiles.service';
import type {
  LanguageProfileDto,
  StatisticsProfileDto,
  WorkProfileDto,
} from './profile.dto';

/**
 * A source reference and a verification date used to be the price of
 * publishing a profile value: a visa success band, a pathway strength, a
 * language waiver or a manual statistic was refused without both, and the
 * whole card was withheld from the public payload besides.
 *
 * Country is a CMS record. An author records what they know and it saves and
 * publishes as written. Both columns remain and are still stored when supplied
 * -- the page prints "Figures verified <date>" from them -- they are simply not
 * a gate any more.
 */

const call = <T>(name: string, dto: T) =>
  (
    CountryProfilesService.prototype as unknown as Record<
      string,
      (value: T, extra?: unknown) => Record<string, unknown>
    >
  )[name](dto, { code: null });

describe('profile values without a source or verification date', () => {
  it('accepts a visa success band', () => {
    expect(() =>
      call<Partial<WorkProfileDto>>('workData', { visaSuccessBand: 'HIGH' }),
    ).not.toThrow();
  });

  it('accepts a visa success percentage', () => {
    expect(() =>
      call<Partial<WorkProfileDto>>('workData', {
        visaSuccessPercentage: '82',
      }),
    ).not.toThrow();
  });

  it('accepts an immigration pathway strength', () => {
    expect(() =>
      call<Partial<WorkProfileDto>>('workData', {
        immigrationPathwayStrength: 'STRONG',
      }),
    ).not.toThrow();
  });

  it('accepts a published language waiver', () => {
    expect(() =>
      call<Partial<LanguageProfileDto>>('languageData', {
        languageWaiverAvailable: true,
      }),
    ).not.toThrow();
  });

  it('accepts manual statistics', () => {
    expect(() =>
      call<Partial<StatisticsProfileDto>>('statisticsData', {
        sourceMode: 'MANUAL',
        universitiesCount: 12,
      }),
    ).not.toThrow();
  });

  it('still stores a source and a date when the author supplies them', () => {
    const data = call<Partial<WorkProfileDto>>('workData', {
      visaSuccessBand: 'HIGH',
      sourceReference: 'https://example.org/visa',
      verifiedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(data.sourceReference).toBe('https://example.org/visa');
    expect(data.verifiedAt).toBeTruthy();
  });

  it('does not weaken the rules that are about the value itself', () => {
    // Hours beyond a week are still impossible, cited or not.
    expect(() =>
      call<Partial<WorkProfileDto>>('workData', {
        partTimeHoursPerWeek: '200',
      }),
    ).toThrow();
    expect(() =>
      call<Partial<WorkProfileDto>>('workData', {
        visaSuccessPercentage: '150',
      }),
    ).toThrow();
  });
});

/**
 * The Country editor no longer has a Source reference or a Verified on control
 * on any profile card, so an ordinary save omits both. Rows written while the
 * workflow existed still carry them, and an edit to an unrelated field must not
 * be what erases them.
 */
describe('a save that omits the withdrawn source fields', () => {
  it('leaves both columns out of the write rather than nulling them', () => {
    const data = call<Partial<WorkProfileDto>>('workData', {
      visaType: 'Student Visa (S)',
    });

    /* Prisma only writes the keys it is given: undefined leaves the stored
     * value alone, whereas null would clear it. */
    expect(data.sourceReference).toBeUndefined();
    expect(data.verifiedAt).toBeUndefined();
    expect(data.visaType).toBe('Student Visa (S)');
  });

  it('does the same when the client echoes an explicit null back', () => {
    const data = call<Partial<WorkProfileDto>>('workData', {
      visaType: 'Student Visa (S)',
      sourceReference: null as unknown as string,
      verifiedAt: null as unknown as string,
    });

    expect(data.sourceReference).toBeUndefined();
    expect(data.verifiedAt).toBeUndefined();
  });

  it('still stores a source reference an importer supplies', () => {
    const data = call<Partial<WorkProfileDto>>('workData', {
      sourceReference: 'https://boi.gov.in/legacy',
      verifiedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(data.sourceReference).toBe('https://boi.gov.in/legacy');
    expect(data.verifiedAt).toBeInstanceOf(Date);
  });
});
