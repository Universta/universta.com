import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ContentSectionDto } from './editorial.dto';

/**
 * The section key was one of a fixed list. The public page has dedicated
 * renderers for those conventional keys and falls back to the section type for
 * anything else, so refusing a key outside the list never protected the
 * rendering -- it only stopped an author naming a section of their own.
 */

const errorsFor = async (value: Record<string, unknown>) =>
  (await validate(plainToInstance(ContentSectionDto, value))).flatMap((issue) =>
    Object.keys(issue.constraints ?? {}).map(() => issue.property),
  );

const section = (overrides: Record<string, unknown> = {}) => ({
  sectionType: 'RICH_TEXT',
  ...overrides,
});

describe('content section key', () => {
  it('accepts a key an author invented', async () => {
    expect(
      await errorsFor(section({ sectionKey: 'a-key-nobody-listed' })),
    ).toEqual([]);
  });

  it('still accepts the conventional keys', async () => {
    for (const key of ['why-study', 'visa-process', 'trust-disclaimer'])
      expect(await errorsFor(section({ sectionKey: key }))).toEqual([]);
  });

  it('is optional, so a section can be saved without one', async () => {
    expect(await errorsFor(section())).toEqual([]);
  });

  it('still bounds the length, because the column does', async () => {
    expect(await errorsFor(section({ sectionKey: 'k'.repeat(101) }))).toContain(
      'sectionKey',
    );
  });

  it('still refuses a key that is not a string', async () => {
    expect(await errorsFor(section({ sectionKey: { nope: true } }))).toContain(
      'sectionKey',
    );
  });
});
