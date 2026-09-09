import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Country features and accepted English tests, as master data.
 *
 * Both used to be hard-coded arrays here and a second, hand-maintained copy in
 * the Admin form, so adding one needed a release and the two lists could drift.
 * They are rows now, and this is the only place that reads them: validation on
 * write, labels on read, and the option lists both the Admin and the public
 * filters are built from.
 *
 * Codes are unchanged from the constants they replaced, because published
 * country configurations store the code and the public surface matches on it.
 */

export type TaxonomyKind = 'feature' | 'englishTest';

export type TaxonomyOption = {
  code: string;
  name: string;
  status: string;
  displayOrder: number;
  isSystem: boolean;
};

/** Both taxonomies resolved together. A country payload needs the feature
 * labels and the two code sets at once, and reading them per record would put
 * two queries behind every row of a listing. */
export type TaxonomySnapshot = {
  features: TaxonomyOption[];
  englishTests: TaxonomyOption[];
  featureLabels: Map<string, string>;
  testLabels: Map<string, string>;
  featureCodes: Set<string>;
  testCodes: Set<string>;
};

/** Codes are matched by published data and by public filters, so they are
 * normalised to one shape rather than being taken as typed. */
function toCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

/** A code whose row has since been removed still has to render as something.
 * The code itself is readable enough once the underscores are gone, which
 * beats showing a blank chip on a published page. */
export function taxonomyLabel(
  labels: Map<string, string>,
  code: string,
): string {
  const known = labels.get(code);
  if (known) return known;
  const words = code.toLowerCase().replace(/_+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : code;
}

@Injectable()
export class CountryTaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  /* The two delegates are different types, so each read branches rather than
   * selecting a delegate: a union of them is not callable. */
  private async rows(
    kind: TaxonomyKind,
    where: { status?: string },
  ): Promise<TaxonomyOption[]> {
    const args = {
      where,
      orderBy: [{ displayOrder: 'asc' as const }, { name: 'asc' as const }],
      select: {
        code: true,
        name: true,
        status: true,
        displayOrder: true,
        isSystem: true,
      },
    };
    return kind === 'feature'
      ? this.prisma.countryFeature.findMany(args)
      : this.prisma.countryEnglishTest.findMany(args);
  }

  /** Active options, in the order the editor and the public filters show them. */
  async options(kind: TaxonomyKind): Promise<TaxonomyOption[]> {
    return this.rows(kind, { status: 'ACTIVE' });
  }

  /** Every code, active or not, so a country that already stores a retired
   * option keeps it rather than having it silently dropped on the next save. */
  async knownCodes(kind: TaxonomyKind): Promise<Set<string>> {
    const rows = await this.rows(kind, {});
    return new Set(rows.map((row) => row.code));
  }

  /** Code to label, for the public payload. Codes with no row left fall back to
   * a readable version of themselves rather than rendering blank. */
  async labels(kind: TaxonomyKind): Promise<Map<string, string>> {
    const rows = await this.rows(kind, {});
    return new Map(rows.map((row) => [row.code, row.name]));
  }

  /** Everything a country payload needs, in one round trip.
   *
   * Both code sets carry inactive rows as well: a country that already stores
   * a since-retired option keeps showing it, rather than having it quietly
   * disappear the next time anyone saves that country. */
  async snapshot(): Promise<TaxonomySnapshot> {
    const [allFeatures, allTests] = await Promise.all([
      this.rows('feature', {}),
      this.rows('englishTest', {}),
    ]);
    return {
      features: allFeatures.filter((row) => row.status === 'ACTIVE'),
      englishTests: allTests.filter((row) => row.status === 'ACTIVE'),
      featureLabels: new Map(allFeatures.map((row) => [row.code, row.name])),
      testLabels: new Map(allTests.map((row) => [row.code, row.name])),
      featureCodes: new Set(allFeatures.map((row) => row.code)),
      testCodes: new Set(allTests.map((row) => row.code)),
    };
  }

  async create(
    kind: TaxonomyKind,
    input: { name: string; code?: string },
  ): Promise<TaxonomyOption> {
    const name = input.name?.trim() ?? '';
    if (!name)
      throw new BadRequestException({
        code: 'COUNTRY_TAXONOMY_NAME_REQUIRED',
        message:
          kind === 'feature'
            ? 'A feature name is required'
            : 'An English test name is required',
        details: null,
      });
    const code = toCode(input.code?.trim() || name);
    if (!code)
      throw new BadRequestException({
        code: 'COUNTRY_TAXONOMY_CODE_INVALID',
        message: 'The name must contain at least one letter or number',
        details: null,
      });

    /* Adding one that already exists returns it rather than failing: two
     * operators reaching for the same obvious option is not an error, and the
     * editor can select whatever comes back either way. */
    const all = await this.rows(kind, {});
    const existing = all.find((row) => row.code === code || row.name === name);
    if (existing) return existing;

    const displayOrder =
      all.reduce((max, row) => Math.max(max, row.displayOrder), 0) + 1;
    const data = {
      code,
      name: name.slice(0, 100),
      displayOrder,
      isSystem: false,
    };
    const select = {
      code: true,
      name: true,
      status: true,
      displayOrder: true,
      isSystem: true,
    };
    return kind === 'feature'
      ? this.prisma.countryFeature.create({ data, select })
      : this.prisma.countryEnglishTest.create({ data, select });
  }
}
