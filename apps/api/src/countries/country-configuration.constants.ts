/* The country feature and accepted-English-test lists used to live here as
 * `as const` arrays, and were the reason adding either one needed a release.
 * They are rows now -- `country_features` and `country_english_tests`, seeded
 * from exactly these codes -- and `CountryTaxonomyService` is the only thing
 * that reads them. Nothing should reintroduce a second copy here.
 */

export const INTAKE_MONTHS = [
  [1, 'January'],
  [2, 'February'],
  [3, 'March'],
  [4, 'April'],
  [5, 'May'],
  [6, 'June'],
  [7, 'July'],
  [8, 'August'],
  [9, 'September'],
  [10, 'October'],
  [11, 'November'],
  [12, 'December'],
] as const;
