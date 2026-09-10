import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateCountryDto } from './dto/country.dto';

/**
 * The documents a student needs in hand to study in a destination. Owned by
 * the country and edited as one list, so the contract matches `subjectIds` and
 * `tagIds`: a supplied array replaces the set, and an omitted key leaves it
 * alone -- which is what stops an importer that never mentions documents from
 * clearing them.
 */

const errorsFor = async (value: Record<string, unknown>) => {
  const issues = await validate(plainToInstance(UpdateCountryDto, value));
  const flatten = (list: typeof issues): string[] =>
    list.flatMap((issue) => [
      ...(issue.constraints ? [issue.property] : []),
      ...flatten(issue.children ?? []),
    ]);
  return flatten(issues);
};

const country = (overrides: Record<string, unknown> = {}) => ({
  name: 'Malta',
  ...overrides,
});

describe('country documents', () => {
  it('accepts a list of documents', async () => {
    expect(
      await errorsFor(
        country({
          documents: [
            {
              name: 'Passport',
              details: '<p>Six months validity.</p>',
              isRequired: true,
            },
            { name: 'Police clearance', isRequired: false },
          ],
        }),
      ),
    ).toEqual([]);
  });

  it('accepts an empty list, which clears them', async () => {
    expect(await errorsFor(country({ documents: [] }))).toEqual([]);
  });

  it('is optional, so a country never mentioning them keeps what it has', async () => {
    expect(await errorsFor(country())).toEqual([]);
  });

  it('requires a name on each row', async () => {
    expect(
      await errorsFor(country({ documents: [{ details: 'No name.' }] })),
    ).toContain('name');
    expect(await errorsFor(country({ documents: [{ name: '' }] }))).toContain(
      'name',
    );
  });

  it('bounds the name and the details, because the columns do', async () => {
    expect(
      await errorsFor(country({ documents: [{ name: 'x'.repeat(201) }] })),
    ).toContain('name');
    expect(
      await errorsFor(
        country({
          documents: [{ name: 'Passport', details: 'x'.repeat(4001) }],
        }),
      ),
    ).toContain('details');
  });

  it('refuses an unreasonable number of them', async () => {
    expect(
      await errorsFor(
        country({
          documents: Array.from({ length: 51 }, (_, i) => ({
            name: `Doc ${i}`,
          })),
        }),
      ),
    ).toContain('documents');
  });
});
