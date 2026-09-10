import { CountryProfilesService } from './country-profiles.service';
import type { CountryIntakeItemDto } from './profile.dto';

/**
 * The two application notes are what a published intake card actually prints
 * beside "Applications open" and "Apply by". They had no control in the Admin
 * at all and were stored verbatim, so they were the one pair of intake fields
 * that could not be authored -- and, had anything written markup to them,
 * would have stored it unchecked.
 *
 * They are edited in the WYSIWYG now and follow `notes`, which sits next to
 * them on the same card: sanitise on the way in, so the same subset survives
 * whether it arrived from the editor or from an importer.
 */

const intakeData = (item: Partial<CountryIntakeItemDto>) =>
  (
    CountryProfilesService.prototype as unknown as {
      intakeData: (
        countryId: string,
        value: Partial<CountryIntakeItemDto>,
      ) => Record<string, unknown>;
    }
  ).intakeData('country-1', { intakeId: 'intake-1', ...item });

describe('intake application notes', () => {
  it('keeps the editor subset', () => {
    const data = intakeData({
      applicationOpeningNote: '<p>Opens in <strong>March</strong></p>',
      applicationDeadlineNote: '<ul><li>15 June</li></ul>',
    });

    expect(data.applicationOpeningNote).toContain('<strong>March</strong>');
    expect(data.applicationDeadlineNote).toContain('<li>15 June</li>');
  });

  it('strips what the subset does not allow', () => {
    const data = intakeData({
      applicationOpeningNote: '<p>Opens</p><script>alert(1)</script>',
      applicationDeadlineNote: '<a href="javascript:alert(1)">Apply</a>',
    });

    expect(data.applicationOpeningNote).toContain('Opens');
    expect(data.applicationOpeningNote).not.toContain('<script');
    expect(data.applicationDeadlineNote).not.toContain('javascript:');
  });

  it('leaves a note that was already plain text alone', () => {
    // Everything stored before the field had an editor looks like this.
    const data = intakeData({ applicationOpeningNote: 'Opens in March' });

    expect(data.applicationOpeningNote).toBe('Opens in March');
  });

  it('sends nothing for a note that was not supplied', () => {
    const data = intakeData({});

    expect(data.applicationOpeningNote).toBeUndefined();
    expect(data.applicationDeadlineNote).toBeUndefined();
  });
});
