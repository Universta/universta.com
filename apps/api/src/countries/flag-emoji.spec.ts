import { flagEmojiFromIso } from './country-metadata';

/**
 * A country's flag is derived from its ISO code rather than uploaded, so the
 * public payload has to carry the derivation -- otherwise every client either
 * reimplements it or, as the listing did, prints the initials of the name
 * instead of the flag.
 */
describe('flagEmojiFromIso', () => {
  it('turns an ISO code into its flag', () => {
    expect(flagEmojiFromIso('IN')).toBe('\u{1F1EE}\u{1F1F3}');
    expect(flagEmojiFromIso('GB')).toBe('\u{1F1EC}\u{1F1E7}');
  });

  it('accepts the casing and padding a stored value may carry', () => {
    expect(flagEmojiFromIso('in')).toBe('\u{1F1EE}\u{1F1F3}');
    expect(flagEmojiFromIso(' In ')).toBe('\u{1F1EE}\u{1F1F3}');
  });

  it('gives nothing back for anything that is not an ISO code', () => {
    for (const value of [null, undefined, '', 'I', 'IND', '12', 'I1'])
      expect(flagEmojiFromIso(value)).toBe('');
  });
});
