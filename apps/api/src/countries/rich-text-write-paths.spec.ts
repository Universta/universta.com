import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sanitizeRichText } from '../common/rich-text';

/**
 * Every Country rich-text field is authored in a WYSIWYG, and the editor tidies
 * what it produces -- but the editor is not the boundary. These routes accept
 * whatever a client sends them, so each write path sanitises server-side.
 *
 * Three paths carry rich text: the Country core (overview, short description),
 * the profile cards (notes, summaries, disclaimers, intake notes) and the
 * editorial records (FAQ answers, section ledes and bodies, consultant card
 * copy). The editorial path has covered this for a while; the other two did not
 * until now, which is what these pin.
 */

const UNSAFE = [
  ['a script block', '<p>ok</p><script>alert(1)</script>', '<script'],
  ['an inline handler', '<p onclick="steal()">ok</p>', 'onclick'],
  [
    'a javascript: link',
    '<p>ok <a href="javascript:alert(1)">x</a></p>',
    'javascript:',
  ],
  [
    'an iframe',
    '<p>ok</p><iframe src="https://evil.test"></iframe>',
    '<iframe',
  ],
  ['a style block', '<style>p{}</style><p>ok</p>', '<style'],
] as const;

describe('rich-text sanitisation contract', () => {
  it.each(UNSAFE)('removes %s', (_label, input, forbidden) => {
    const output = String(sanitizeRichText(input));
    expect(output).not.toContain(forbidden);
    expect(output).toContain('ok');
  });

  it('keeps the authored subset the editor produces', () => {
    const authored =
      '<h2>Head</h2><p><strong>b</strong> <em>i</em> <u>u</u> <s>s</s></p><ul><li>one</li></ul><ol><li>two</li></ol><blockquote>q</blockquote>';
    expect(String(sanitizeRichText(authored))).toBe(authored);
  });

  it('keeps a safe link and an alignment the renderer supports', () => {
    expect(
      String(sanitizeRichText('<a href="https://example.org">x</a>')),
    ).toContain('href="https://example.org"');
    expect(
      String(sanitizeRichText('<p style="text-align: center">x</p>')),
    ).toContain('text-align: center');
  });

  it('leaves legacy plain text exactly as it was stored', () => {
    const legacy = 'A plain note written before the editor existed.';
    expect(String(sanitizeRichText(legacy))).toBe(legacy);
  });

  it('passes a non-string through untouched, so a cleared field stays cleared', () => {
    expect(sanitizeRichText(undefined)).toBeUndefined();
    expect(sanitizeRichText(null)).toBeNull();
  });
});

/**
 * A guard against the fields drifting apart again: every descriptive field the
 * profile service writes has to go through `richText`, not the plain
 * `optionalText` beside it. Read from source because the alternative is
 * remembering to add a case here each time a field is added.
 */
describe('profile write path coverage', () => {
  const source = readFileSync(
    join(__dirname, 'profiles/country-profiles.service.ts'),
    'utf8',
  );

  const DESCRIPTIVE = [
    'tuitionNotes',
    'livingCostNotes',
    'partTimeSummary',
    'postStudyWorkSummary',
    'immigrationPathwaySummary',
    'visaInformation',
    'proofOfFundsSummary',
    'ieltsNotes',
    'pteNotes',
    'toeflNotes',
    'duolingoNotes',
    'waiverNotes',
    'generalNotes',
    'notes',
  ];

  it.each(DESCRIPTIVE)('sanitises %s on write', (field) => {
    expect(source).toContain(`${field}: richText(`);
    expect(source).not.toContain(`${field}: optionalText(`);
  });

  it('sanitises every disclaimer, on all three cards', () => {
    expect(source.match(/disclaimer: richText\(/g) ?? []).toHaveLength(3);
    expect(source).not.toContain('disclaimer: optionalText(');
  });
});
