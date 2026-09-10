import { CountryProfilesService } from './country-profiles.service';
import type { WorkProfileDto } from './profile.dto';

/**
 * A visa fee is quoted in the Country's own currency. The Work and visa card
 * used to ask for a second copy of that code, which could only ever agree with
 * the Country by luck -- and nothing stopped a client sending a third answer.
 *
 * The stored code is derived from the Country now, so a mismatch cannot be
 * authored. A Country with no currency yet has nothing to inherit, and there
 * the older behaviour still applies so no existing code is lost.
 */

const workData = (
  dto: Partial<WorkProfileDto>,
  inherited: { code: string | null },
) =>
  (
    CountryProfilesService.prototype as unknown as {
      workData: (
        value: Partial<WorkProfileDto>,
        from: { code: string | null },
      ) => Record<string, unknown>;
    }
  ).workData(dto, inherited);

describe('visa fee currency', () => {
  it('takes the country currency', () => {
    expect(
      workData({ visaFee: '50' }, { code: 'EUR' }).visaFeeCurrencyCode,
    ).toBe('EUR');
  });

  it('overrides a different code a client sent, so no mismatch can be stored', () => {
    expect(
      workData({ visaFee: '50', visaFeeCurrencyCode: 'QQQ' }, { code: 'EUR' })
        .visaFeeCurrencyCode,
    ).toBe('EUR');
  });

  it('follows the country when its currency changes', () => {
    expect(
      workData({ visaFee: '50' }, { code: 'sek' }).visaFeeCurrencyCode,
    ).toBe('SEK');
  });

  it('keeps what the caller sent while the country has no currency', () => {
    expect(
      workData({ visaFeeCurrencyCode: 'gbp' }, { code: null })
        .visaFeeCurrencyCode,
    ).toBe('GBP');
  });

  it('leaves a stored legacy code alone when there is nothing to inherit', () => {
    /* Undefined is what Prisma reads as "do not touch this column", which is
     * what keeps a code written before this rule from being wiped. */
    expect(
      workData({ visaFee: '50' }, { code: null }).visaFeeCurrencyCode,
    ).toBeUndefined();
  });
});
