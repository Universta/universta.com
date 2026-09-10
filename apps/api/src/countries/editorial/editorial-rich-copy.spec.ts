import { BadRequestException } from '@nestjs/common';
import { CountryEditorialService } from './country-editorial.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { CountriesService } from '../countries.service';
import type { CountryProfilesService } from '../profiles/country-profiles.service';
import type { AuthenticatedRequest } from '../../auth/auth.types';

/**
 * Two fields moved into the WYSIWYG but kept the plain-copy contract, so the
 * API refused the very markup the editor now produces: an operator who bolded a
 * word in a section lede or a consultant card blurb got "Editorial copy cannot
 * contain HTML or unsafe URLs" and lost the save.
 *
 * They follow the same rule as a FAQ answer or a card overview now -- sanitise
 * and store, rather than refuse -- while the short plain labels beside them
 * (heading, title, slug, CTA label) still reject markup outright.
 */

const SAFE =
  '<p>English-taught degrees in <strong>Malta</strong>, with <em>EU</em> recognition.</p><ul><li>Three years</li></ul><a href="https://example.org/guide">Guide</a>';
const UNSAFE =
  '<p>Safe</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><p onclick="steal()">z</p>';

function service() {
  const written: Record<string, unknown>[] = [];
  const capture = { data: (value: Record<string, unknown>) => value };
  const prisma = {
    country: { findFirst: async () => ({ id: 'country-1' }) },
    mediaAsset: { findMany: async () => [] },
    countryContentSection: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        written.push(data);
        return {
          id: 'section-1',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
    },
    consultantLandingCard: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        written.push(data);
        return {
          id: 'card-1',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
      findFirst: async () => null,
    },
    // The service records every write; the audit row is not what is under test.
    auditLog: { create: async () => ({ id: 'audit-1' }) },
    $transaction: async (fn: (tx: unknown) => unknown) => fn(prisma),
  } as unknown as PrismaService;
  void capture;
  const instance = new CountryEditorialService(
    prisma,
    {} as CountriesService,
    {} as CountryProfilesService,
  );
  return { instance, written };
}

const request = {
  user: { sub: 'user-1' },
  ip: '127.0.0.1',
  requestId: 'req-1',
  get: () => undefined,
} as unknown as AuthenticatedRequest;

const section = (overrides: Record<string, unknown> = {}) =>
  ({
    sectionKey: 'why-study',
    sectionType: 'RICH_TEXT',
    heading: 'Why Malta',
    bodyJson: { paragraphs: ['A sourced paragraph'] },
    displayOrder: 0,
    ...overrides,
  }) as never;

const card = (overrides: Record<string, unknown> = {}) =>
  ({
    title: 'Talk to a counsellor',
    slug: 'talk-to-a-counsellor',
    shortDescription: 'Plain blurb.',
    ctaLabel: 'Book',
    displayOrder: 0,
    ...overrides,
  }) as never;

describe('editorial rich copy contract', () => {
  it('accepts a section lede written in the editor subset', async () => {
    const { instance, written } = service();

    await instance.createSection(
      'country-1',
      section({ subheading: SAFE }),
      request,
    );

    const stored = String(written[0].subheading);
    expect(stored).toContain('<strong>Malta</strong>');
    expect(stored).toContain('<li>Three years</li>');
    expect(stored).toContain('href="https://example.org/guide"');
  });

  it('strips unsafe markup from a section lede rather than storing it', async () => {
    const { instance, written } = service();

    await instance.createSection(
      'country-1',
      section({ subheading: UNSAFE }),
      request,
    );

    const stored = String(written[0].subheading);
    expect(stored).toContain('Safe');
    expect(stored).not.toContain('<script');
    expect(stored).not.toContain('javascript:');
    expect(stored).not.toContain('onclick');
  });

  it('accepts a consultant card blurb written in the editor subset', async () => {
    const { instance, written } = service();

    await instance.createCard(
      'country-1',
      card({ shortDescription: SAFE }),
      request,
    );

    const stored = String(written[0].shortDescription);
    expect(stored).toContain('<strong>Malta</strong>');
    expect(stored).toContain('<li>Three years</li>');
  });

  it('strips unsafe markup from a consultant card blurb', async () => {
    const { instance, written } = service();

    await instance.createCard(
      'country-1',
      card({ shortDescription: UNSAFE }),
      request,
    );

    const stored = String(written[0].shortDescription);
    expect(stored).toContain('Safe');
    expect(stored).not.toContain('<script');
    expect(stored).not.toContain('javascript:');
  });

  it('keeps legacy plain text exactly as written', async () => {
    const { instance, written } = service();

    await instance.createSection(
      'country-1',
      section({ subheading: 'A plain lede with no markup.' }),
      request,
    );
    await instance.createCard(
      'country-1',
      card({ shortDescription: 'A plain blurb.' }),
      request,
    );

    expect(written[0].subheading).toBe('A plain lede with no markup.');
    expect(written[1].shortDescription).toBe('A plain blurb.');
  });

  it('still refuses markup in the short plain labels beside them', async () => {
    const { instance } = service();

    /* These are one-line labels, not prose: a tag in a heading or a card title
     * is a mistake rather than formatting. */
    await expect(
      instance.createSection(
        'country-1',
        section({ heading: '<b>Why</b>' }),
        request,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      instance.createCard('country-1', card({ title: '<b>Talk</b>' }), request),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      instance.createCard(
        'country-1',
        card({ ctaLabel: 'javascript:alert(1)' }),
        request,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

/**
 * The section body carried the same problem one level down: a media caption and
 * a card or step description are the sentences a reader actually sees, but the
 * body validator rejected any tag anywhere inside `bodyJson`, so those three
 * were the last pieces of section copy that could not be written in the editor.
 *
 * They are sanitised and stored now. Everything else in an item -- the label, a
 * step number, a fact's value, a CTA -- is still a short plain string.
 */
describe('editorial body rich copy contract', () => {
  it('stores a media caption written in the editor subset', async () => {
    const { instance, written } = service();

    await instance.createSection(
      'country-1',
      section({ sectionType: 'MEDIA', bodyJson: { caption: SAFE } }),
      request,
    );

    const body = written[0].bodyJson as { caption: string };
    expect(body.caption).toContain('<strong>Malta</strong>');
    expect(body.caption).toContain('<li>Three years</li>');
  });

  it('strips unsafe markup from a caption rather than refusing the save', async () => {
    const { instance, written } = service();

    await instance.createSection(
      'country-1',
      section({ sectionType: 'MEDIA', bodyJson: { caption: UNSAFE } }),
      request,
    );

    const body = written[0].bodyJson as { caption: string };
    expect(body.caption).toContain('Safe');
    expect(body.caption).not.toContain('<script');
    expect(body.caption).not.toContain('javascript:');
    expect(body.caption).not.toContain('onclick');
  });

  it('stores a card and a step description as rich text', async () => {
    for (const sectionType of ['CARD_GRID', 'STEPS'] as const) {
      const { instance, written } = service();

      await instance.createSection(
        'country-1',
        section({
          sectionType,
          bodyJson: {
            items: [
              {
                ...(sectionType === 'STEPS' ? { step: '01' } : {}),
                title: 'Apply',
                description: SAFE,
              },
            ],
          },
        }),
        request,
      );

      const body = written[0].bodyJson as {
        items: Array<{ description: string }>;
      };
      expect(body.items[0].description).toContain('<strong>Malta</strong>');
    }
  });

  it('leaves a plain description exactly as it was typed', async () => {
    const { instance, written } = service();

    await instance.createSection(
      'country-1',
      section({
        sectionType: 'CARD_GRID',
        bodyJson: { items: [{ title: 'Apply', description: 'A plain step.' }] },
      }),
      request,
    );

    const body = written[0].bodyJson as {
      items: Array<{ description: string }>;
    };
    expect(body.items[0].description).toBe('A plain step.');
  });

  it('still refuses markup in the short strings beside a description', async () => {
    const { instance } = service();

    for (const item of [
      { title: '<b>Apply</b>', description: 'ok' },
      { title: 'Apply', description: 'ok', ctaLabel: '<i>Go</i>' },
    ])
      await expect(
        instance.createSection(
          'country-1',
          section({ sectionType: 'CARD_GRID', bodyJson: { items: [item] } }),
          request,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

    // A fact's value is a figure, and a tag there is still a mistake.
    await expect(
      instance.createSection(
        'country-1',
        section({
          sectionType: 'FACT_GRID',
          bodyJson: { items: [{ label: 'Tuition', value: '<b>9000</b>' }] },
        }),
        request,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
