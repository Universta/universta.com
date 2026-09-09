/**
 * The currency list the Country editor selects from.
 *
 * Currency name, code and symbol used to be three free-text inputs, so nothing
 * stopped "Euro / USD / £" being saved -- three fields that have exactly one
 * correct combination each. They are one choice now, and this table is that
 * choice's vocabulary: the same currencies the API's own country metadata
 * resolves from a country name, so a country identified automatically and one
 * picked by hand agree.
 */
export type CurrencyOption = { code: string; name: string; symbol: string };

export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: '$' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: '$' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: '$' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: '$' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'soʼm' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

const BY_CODE = new Map(CURRENCY_OPTIONS.map((row) => [row.code, row]));

export function currencyByCode(code: string | null | undefined) {
  return code ? (BY_CODE.get(code.trim().toUpperCase()) ?? null) : null;
}

/** Matches a stored currency however it was recorded, so legacy rows that hold
 * only a name or only a symbol still select the right option. */
export function matchCurrency(value: {
  code?: string | null;
  name?: string | null;
  symbol?: string | null;
}) {
  const byCode = currencyByCode(value.code);
  if (byCode) return byCode;
  const name = value.name?.trim().toLowerCase();
  if (name) {
    const found = CURRENCY_OPTIONS.find((row) => row.name.toLowerCase() === name);
    if (found) return found;
  }
  const symbol = value.symbol?.trim();
  if (symbol) {
    const matches = CURRENCY_OPTIONS.filter((row) => row.symbol === symbol);
    /* Only when it is unambiguous -- "$" belongs to several currencies, and
     * guessing one would silently rewrite the operator's data. */
    if (matches.length === 1) return matches[0];
  }
  return null;
}

/**
 * The flag is derived from the ISO code rather than uploaded: two regional
 * indicator letters are the flag emoji for that country, so `MT` renders as
 * the Maltese flag with nothing to upload and nothing to keep in sync.
 */
export function flagEmojiFromIso(iso2: string | null | undefined) {
  const code = iso2?.trim().toUpperCase() ?? '';
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
}
