import { BadRequestException } from '@nestjs/common';
import {
  CountryTaxonomyService,
  taxonomyLabel,
} from './country-taxonomy.service';
import type { PrismaService } from '../prisma/prisma.service';

/**
 * Country features and accepted English tests used to be `as const` arrays --
 * one copy in the API, a second in the Admin form -- so adding either needed a
 * release, and the two lists could drift. They are master data now.
 *
 * What matters here is that an option an operator adds is a real, reusable row
 * with a stable code: the code is what a published country stores and what the
 * public page matches on, so it cannot be whatever was typed.
 */

type Row = {
  code: string;
  name: string;
  status: string;
  displayOrder: number;
  isSystem: boolean;
};

function serviceWith(features: Row[], tests: Row[]) {
  const created: Row[] = [];
  const delegate = (rows: Row[]) => ({
    findMany: ({ where }: { where: { status?: string } }) =>
      Promise.resolve(
        where.status ? rows.filter((row) => row.status === where.status) : rows,
      ),
    create: ({ data }: { data: Omit<Row, 'status'> }) => {
      const row = { status: 'ACTIVE', ...data };
      created.push(row);
      rows.push(row);
      return Promise.resolve(row);
    },
  });
  const prisma = {
    countryFeature: delegate(features),
    countryEnglishTest: delegate(tests),
  } as unknown as PrismaService;
  return { service: new CountryTaxonomyService(prisma), created };
}

const row = (overrides: Partial<Row> = {}): Row => ({
  code: 'BUDGET_FRIENDLY',
  name: 'Budget friendly',
  status: 'ACTIVE',
  displayOrder: 1,
  isSystem: true,
  ...overrides,
});

describe('CountryTaxonomyService', () => {
  it('derives a stable code from the name an operator typed', async () => {
    const { service, created } = serviceWith([row()], []);

    const added = await service.create('feature', {
      name: '  Scholarship  friendly! ',
    });

    expect(added.code).toBe('SCHOLARSHIP_FRIENDLY');
    expect(added.name).toBe('Scholarship  friendly!');
    expect(created).toHaveLength(1);
    // Added options are ordinary rows; only the seeded ones are protected.
    expect(added.isSystem).toBe(false);
  });

  it('returns the existing option instead of failing on a duplicate', async () => {
    const { service, created } = serviceWith([row()], []);

    const again = await service.create('feature', { name: 'budget friendly' });

    expect(again.code).toBe('BUDGET_FRIENDLY');
    expect(again.isSystem).toBe(true);
    expect(created).toHaveLength(0);
  });

  it('refuses a name that yields no code at all', async () => {
    const { service } = serviceWith([], []);

    await expect(service.create('feature', { name: '   ' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.create('feature', { name: '!!!' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('offers only active options but still recognises retired codes', async () => {
    const { service } = serviceWith(
      [
        row(),
        row({ code: 'PR_FRIENDLY', name: 'PR friendly', status: 'RETIRED' }),
      ],
      [],
    );

    expect((await service.options('feature')).map((item) => item.code)).toEqual(
      ['BUDGET_FRIENDLY'],
    );
    /* A country that already stores a retired option keeps it: dropping the
     * code on the next save would quietly rewrite published content. */
    expect(await service.knownCodes('feature')).toContain('PR_FRIENDLY');
  });

  it('keeps the two taxonomies apart', async () => {
    const { service } = serviceWith(
      [row()],
      [row({ code: 'IELTS', name: 'IELTS', displayOrder: 1 })],
    );

    const snapshot = await service.snapshot();

    expect(snapshot.featureCodes.has('IELTS')).toBe(false);
    expect(snapshot.testCodes.has('BUDGET_FRIENDLY')).toBe(false);
    expect(snapshot.featureLabels.get('BUDGET_FRIENDLY')).toBe(
      'Budget friendly',
    );
  });
});

describe('taxonomyLabel', () => {
  it('uses the stored name', () => {
    expect(
      taxonomyLabel(new Map([['PR_FRIENDLY', 'PR friendly']]), 'PR_FRIENDLY'),
    ).toBe('PR friendly');
  });

  it('renders a code whose row is gone rather than an empty chip', () => {
    expect(taxonomyLabel(new Map(), 'SCHOLARSHIP_FRIENDLY')).toBe(
      'Scholarship friendly',
    );
  });
});
