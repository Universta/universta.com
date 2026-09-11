import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EntityType =
  | 'country'
  | 'university'
  | 'scholarship'
  | 'consultant'
  | 'job'
  | 'event'
  | 'course';

interface EntityConfig {
  prefix: string;
  titleField: 'name' | 'title';
  publishedStatuses: string[];
}

/** The public path prefix, display-title field, and "counts as published"
 * statuses for every entity type the internal link picker can point at.
 * Kept in one place so search/resolve/public-resolve all agree on what a
 * canonical URL and a "published" target actually mean per entity. */
const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  country: {
    prefix: '/countries',
    titleField: 'name',
    publishedStatuses: ['PUBLISHED'],
  },
  university: {
    prefix: '/universities',
    titleField: 'name',
    publishedStatuses: ['PUBLISHED'],
  },
  scholarship: {
    prefix: '/scholarships',
    titleField: 'title',
    publishedStatuses: ['PUBLISHED'],
  },
  consultant: {
    prefix: '/study-abroad-consultants',
    titleField: 'name',
    publishedStatuses: ['PUBLISHED'],
  },
  job: {
    prefix: '/careers',
    titleField: 'title',
    publishedStatuses: ['PUBLISHED'],
  },
  event: {
    prefix: '/events',
    titleField: 'title',
    publishedStatuses: ['PUBLISHED'],
  },
  course: {
    prefix: '/courses',
    titleField: 'name',
    publishedStatuses: ['PUBLISHED'],
  },
};
const ENTITY_TYPES = Object.keys(ENTITY_CONFIG) as EntityType[];

/**
 * What the rich-text editor's `%` autocomplete can offer.
 *
 * Deliberately a wider set than ENTITY_CONFIG above, and a separate one. The
 * link picker may only offer records that have a canonical public page to point
 * at; the editor also names things that do not -- a continent, a specialization
 * -- and inserts those as plain text. Folding them into ENTITY_CONFIG would
 * have put unlinkable records into the link picker.
 *
 * `path` is null wherever no public route exists for that entity on its own.
 * Every non-null prefix below corresponds to a real route under apps/web.
 */
type SuggestKind =
  | 'country'
  | 'continent'
  | 'city'
  | 'university'
  | 'subject'
  | 'specialization'
  | 'course'
  | 'scholarship'
  | 'consultant';

interface SuggestConfig {
  /** The Prisma delegate name. */
  model: string;
  titleField: 'name' | 'title';
  /** Public route prefix, or null when the entity has no page of its own. */
  prefix: string | null;
  /** Human label for the result's second line. */
  noun: string;
  /** Whether the row carries a countryId that context ranking can use. */
  countryScoped?: boolean;
}

const SUGGEST_CONFIG: Record<SuggestKind, SuggestConfig> = {
  country: {
    model: 'country',
    titleField: 'name',
    prefix: '/countries',
    noun: 'Country',
  },
  continent: {
    model: 'continent',
    titleField: 'name',
    prefix: null,
    noun: 'Continent',
  },
  city: {
    model: 'city',
    titleField: 'name',
    prefix: null,
    noun: 'City',
    countryScoped: true,
  },
  university: {
    model: 'university',
    titleField: 'name',
    prefix: '/universities',
    noun: 'University',
    countryScoped: true,
  },
  subject: {
    model: 'subject',
    titleField: 'name',
    prefix: '/subjects',
    noun: 'Subject',
  },
  specialization: {
    model: 'subSubject',
    titleField: 'name',
    prefix: null,
    noun: 'Specialization',
  },
  course: {
    model: 'course',
    titleField: 'name',
    prefix: '/courses',
    noun: 'Course',
  },
  scholarship: {
    model: 'scholarship',
    titleField: 'title',
    prefix: '/scholarships',
    noun: 'Scholarship',
  },
  consultant: {
    model: 'consultant',
    titleField: 'name',
    prefix: '/study-abroad-consultants',
    noun: 'Consultant',
  },
};
const SUGGEST_KINDS = Object.keys(SUGGEST_CONFIG) as SuggestKind[];

export interface EditorEntitySuggestion {
  kind: SuggestKind;
  id: string;
  label: string;
  path: string | null;
  detail: string;
  related: boolean;
}

export interface InternalLinkCandidate {
  entityType: EntityType;
  entityId: string;
  label: string;
  slug: string;
  status: string;
  path: string;
}

export interface InternalLinkResolution {
  missing: boolean;
  entityType: EntityType;
  entityId: string;
  label: string | null;
  slug: string | null;
  status: string | null;
  isPublished: boolean;
  path: string | null;
}

function isEntityType(value: string): value is EntityType {
  return (ENTITY_TYPES as string[]).includes(value);
}

@Injectable()
export class InternalLinksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records the rich-text editor's `%` autocomplete can name.
   *
   * `countryId` is the record being edited, not a filter: everything still
   * comes back, but rows belonging to that country are flagged so the editor
   * can rank them above unrelated global results. An author writing about
   * India who types `%ii` wants the two Indian institutes first, not an
   * alphabetical sweep of every university in the catalogue.
   *
   * Cities are the one entity whose public path needs a second value -- the
   * route is /study-in/<country>/<city> -- so their country slug is selected
   * alongside and the path is built only when it is there.
   */
  async editorEntities(
    q: string,
    countryId?: string,
  ): Promise<EditorEntitySuggestion[]> {
    const query = (q ?? '').trim();
    const results = await Promise.all(
      SUGGEST_KINDS.map((kind) => this.suggestOne(kind, query, countryId)),
    );
    /* Interleaved rather than concatenated, so a short list does not push a
     * long one off the end: the editor ranks what it is given, and it should be
     * given a spread of kinds to rank. */
    const byKind = results.filter((rows) => rows.length);
    const merged: EditorEntitySuggestion[] = [];
    for (let index = 0; merged.length < 40; index += 1) {
      const row = byKind
        .filter((rows) => rows[index])
        .map((rows) => rows[index]);
      if (!row.length) break;
      merged.push(...row);
    }
    return merged.slice(0, 40);
  }

  private async suggestOne(
    kind: SuggestKind,
    q: string,
    countryId?: string,
  ): Promise<EditorEntitySuggestion[]> {
    const config = SUGGEST_CONFIG[kind];
    // Prisma's generated delegates are selected by a key of SUGGEST_CONFIG,
    // never by anything a caller supplies.

    const delegate = (this.prisma as any)[config.model];
    if (!delegate) return [];
    const rows = await delegate.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { [config.titleField]: { contains: q } },
                { slug: { contains: q } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        [config.titleField]: true,
        ...(config.countryScoped ? { countryId: true } : {}),
        ...(kind === 'city' ? { country: { select: { slug: true } } } : {}),
      },
      orderBy: { [config.titleField]: 'asc' },
      take: 8,
    });
    return rows.map((row: Record<string, any>) => ({
      kind,
      id: String(row.id),
      label: String(row[config.titleField]),
      path: this.suggestPath(kind, config, row),
      detail: config.noun,
      related: Boolean(
        countryId &&
        (config.countryScoped
          ? row.countryId === countryId
          : kind === 'country' && row.id === countryId),
      ),
    }));
  }

  private suggestPath(
    kind: SuggestKind,
    config: SuggestConfig,
    row: Record<string, any>,
  ): string | null {
    if (kind === 'city') {
      const country = row.country?.slug;
      return country ? `/study-in/${country}/${String(row.slug)}` : null;
    }
    return config.prefix ? `${config.prefix}/${String(row.slug)}` : null;
  }

  /** Admin search: visible regardless of publish status, so an editor can
   * link to (and see the warning for) a not-yet-published record. */
  async search(
    q: string,
    entityType?: string,
  ): Promise<InternalLinkCandidate[]> {
    const types =
      entityType && isEntityType(entityType) ? [entityType] : ENTITY_TYPES;
    const results = await Promise.all(
      types.map((type) => this.searchOne(type, q)),
    );
    return results.flat().slice(0, 25);
  }

  private async searchOne(
    type: EntityType,
    q: string,
  ): Promise<InternalLinkCandidate[]> {
    const config = ENTITY_CONFIG[type];
    // Prisma's generated delegates are selected by a validated entity type.

    const delegate = (this.prisma as any)[type];
    const rows = await delegate.findMany({
      where: {
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { [config.titleField]: { contains: q } },
                { slug: { contains: q } },
              ],
            }
          : {}),
      },
      select: { id: true, slug: true, status: true, [config.titleField]: true },
      orderBy: { [config.titleField]: 'asc' },
      take: 8,
    });
    return rows.map((row: Record<string, unknown>) => ({
      entityType: type,
      entityId: String(row.id),
      label: String(row[config.titleField]),
      slug: String(row.slug),
      status: String(row.status),
      path: `${config.prefix}/${String(row.slug)}`,
    }));
  }

  /** Admin resolve: recomputes the canonical path from the entity's
   * *current* slug (so a stored `internal://type/id` reference never goes
   * stale after a rename) and reports whether it is missing or unpublished
   * so the editor sees a warning instead of a silently broken link. */
  async resolve(
    entityType: string,
    entityId: string,
  ): Promise<InternalLinkResolution> {
    if (!isEntityType(entityType) || !entityId)
      return {
        missing: true,
        entityType: (entityType as EntityType) ?? 'country',
        entityId,
        label: null,
        slug: null,
        status: null,
        isPublished: false,
        path: null,
      };
    const config = ENTITY_CONFIG[entityType];

    const delegate = (this.prisma as any)[entityType];
    const row = await delegate.findFirst({
      where: { id: entityId, deletedAt: null },
      select: { id: true, slug: true, status: true, [config.titleField]: true },
    });
    if (!row)
      return {
        missing: true,
        entityType,
        entityId,
        label: null,
        slug: null,
        status: null,
        isPublished: false,
        path: null,
      };
    const isPublished = config.publishedStatuses.includes(String(row.status));
    return {
      missing: false,
      entityType,
      entityId,
      label: String(row[config.titleField]),
      slug: String(row.slug),
      status: String(row.status),
      isPublished,
      path: `${config.prefix}/${String(row.slug)}`,
    };
  }

  /** Public resolve: only ever returns a path for a currently-published
   * target. A visitor must never be handed a link into draft content, even
   * if the admin who authored the link left it pointing at one. */
  async resolvePublic(
    entityType: string,
    entityId: string,
  ): Promise<{ path: string | null }> {
    const resolved = await this.resolve(entityType, entityId);
    return { path: resolved.isPublished ? resolved.path : null };
  }
}
