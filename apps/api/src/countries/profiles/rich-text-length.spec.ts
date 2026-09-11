import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  CostProfileDto,
  LanguageProfileDto,
  RICH_TEXT_MAX,
  WorkProfileDto,
} from './profile.dto';

/**
 * How much authored copy a profile's rich-text field accepts.
 *
 * These fields are edited in the WYSIWYG and stored in `TEXT` columns, and the
 * request contract disagreed with both: tuition and living-cost notes were
 * capped at a thousand characters, the visa and waiver summaries at two
 * thousand. A single authored section of destination guidance passes either
 * without trying.
 *
 * What that cost was not a validation message. The editor writes the profile
 * cards one after another inside the country's own save, so the 400 on the
 * first card threw out of the flush and the cards behind it were never sent --
 * four sections of authored content lost to one field being too long, with the
 * country row itself saved and nothing on screen naming the field.
 *
 * The bodies below are the shape an author actually produces: several
 * paragraphs of marked-up prose.
 */

function markup(characters: number) {
  const sentence = '<p>Tuition here depends on who funds the institution.</p>';
  return sentence
    .repeat(Math.ceil(characters / sentence.length))
    .slice(0, characters);
}

function errorsFor<T extends object>(
  dto: new () => T,
  payload: Record<string, unknown>,
) {
  return validateSync(plainToInstance(dto, payload) as object).flatMap(
    (error) =>
      Object.keys(error.constraints ?? {}).map(
        (constraint) => `${error.property}.${constraint}`,
      ),
  );
}

describe('profile rich text accepts what the editor invites', () => {
  it('takes several paragraphs of tuition and living-cost guidance', () => {
    expect(
      errorsFor(CostProfileDto, {
        tuitionNotes: markup(4000),
        livingCostNotes: markup(4000),
      }),
    ).toEqual([]);
  });

  it('takes a full work, post-study and pathway summary', () => {
    expect(
      errorsFor(WorkProfileDto, {
        partTimeSummary: markup(4000),
        postStudyWorkSummary: markup(4000),
        immigrationPathwaySummary: markup(4000),
        proofOfFundsSummary: markup(4000),
      }),
    ).toEqual([]);
  });

  it('takes a full waiver and general English note', () => {
    expect(
      errorsFor(LanguageProfileDto, {
        waiverNotes: markup(4000),
        generalNotes: markup(4000),
      }),
    ).toEqual([]);
  });

  /* The limit is still a limit. It sits where `disclaimer` and
   * `visaInformation` already put it, well inside the column. */
  it('still refuses a body past the shared limit', () => {
    expect(
      errorsFor(CostProfileDto, { tuitionNotes: markup(RICH_TEXT_MAX + 1) }),
    ).toEqual(['tuitionNotes.maxLength']);
  });

  /* The four per-test English notes are authored in the same WYSIWYG as
   * everything else on the card, so they share the same limit. Their columns
   * were widened from VARCHAR(500) to TEXT in the same change; pinning a body
   * well past the old width is what would catch the contract and the column
   * drifting apart again. */
  it('takes a full note for each English test', () => {
    expect(
      errorsFor(LanguageProfileDto, {
        ieltsNotes: markup(4000),
        pteNotes: markup(4000),
        toeflNotes: markup(4000),
        duolingoNotes: markup(4000),
      }),
    ).toEqual([]);
  });

  it('still refuses a per-test note past the shared limit', () => {
    expect(
      errorsFor(LanguageProfileDto, { ieltsNotes: markup(RICH_TEXT_MAX + 1) }),
    ).toEqual(['ieltsNotes.maxLength']);
  });
});
