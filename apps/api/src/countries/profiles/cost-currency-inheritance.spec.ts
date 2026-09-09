import { BadRequestException } from '@nestjs/common';
import { CountryProfilesService } from './country-profiles.service';
import type { CostProfileDto } from './profile.dto';

/**
 * The cost card stopped asking for a currency: amounts are published in the
 * Country's own currency, and a second copy on the profile could only disagree
 * with it. The API still demanded one, so the card became unsaveable the
 * moment an author typed an amount -- refused for a field the editor no longer
 * showed, with nothing on screen to fix.
 *
 * It inherits instead. An importer that sends a currency explicitly still
 * wins, and a country that has no currency at all is still refused, because
 * amounts with no unit mean nothing on the public page.
 */

const costData = (
  dto: Partial<CostProfileDto>,
  inherited: { code: string | null; symbol: string | null },
) =>
  (
    CountryProfilesService.prototype as unknown as {
      costData: (
        value: Partial<CostProfileDto>,
        from: { code: string | null; symbol: string | null },
      ) => Record<string, unknown>;
    }
  ).costData(dto, inherited);

describe('cost profile currency', () => {
  it('inherits the country currency when the card sends none', () => {
    const data = costData({ tuitionMin: '9100' }, { code: 'EUR', symbol: '€' });

    expect(data.currencyCode).toBe('EUR');
    expect(data.currencySymbol).toBe('€');
  });

  it('keeps a currency an importer set explicitly', () => {
    const data = costData(
      { tuitionMin: '9100', currencyCode: 'sek', currencySymbol: 'kr' },
      { code: 'EUR', symbol: '€' },
    );

    expect(data.currencyCode).toBe('SEK');
    expect(data.currencySymbol).toBe('kr');
  });

  it('does not pair an inherited code with the old currency symbol', () => {
    /* An explicit code with no symbol means "this currency, no symbol" -- the
     * country's symbol belongs to a different currency and would misprint the
     * amounts. */
    const data = costData(
      { currencyCode: 'SEK' },
      { code: 'EUR', symbol: '€' },
    );

    expect(data.currencyCode).toBe('SEK');
    expect(data.currencySymbol).toBeUndefined();
  });

  it('still refuses amounts when neither the card nor the country has one', () => {
    expect(() =>
      costData({ tuitionMin: '9100' }, { code: null, symbol: null }),
    ).toThrow(BadRequestException);
  });

  it('still rejects a malformed code rather than silently inheriting', () => {
    expect(() =>
      costData({ currencyCode: 'EUROS' }, { code: 'EUR', symbol: '€' }),
    ).toThrow(BadRequestException);
  });
});
