/**
 * A country-course mapping is public because the relationship is real, not
 * because someone has finished citing it.
 *
 * Source references and verification dates remain useful editorial metadata,
 * but gating visibility on them hid the entire seeded catalogue: courses that
 * were published, mapped to published countries and genuinely available simply
 * did not appear. These cases pin the corrected rule, and pin the conditions
 * that must still exclude a mapping.
 */
import { ExpressAdapter } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/bootstrap';
import { PrismaService } from '../src/prisma/prisma.service';

const TAG = 'ccgate';
const slug = (name: string) => `${TAG}-${name}`;

type PublicCourse = { slug: string };

function courseSlugs(response: { body: unknown }): string[] {
  const body = response.body as { data: PublicCourse[] };
  return (body.data ?? []).map((course) => course.slug);
}

describe('country-course public visibility gate (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const ids: Record<string, string> = {};

  beforeAll(async () => {
    const fixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = fixture.createNestApplication(new ExpressAdapter());
    configureApplication(app);
    await app.init();
    prisma = app.get(PrismaService);

    await cleanup();

    const level = await prisma.courseLevel.findFirst({
      where: { status: 'ACTIVE' },
    });
    const mode = await prisma.studyMode.findFirst({
      where: { status: 'ACTIVE' },
    });
    if (!level || !mode)
      throw new Error('expected an active course level and study mode');

    const subject = await prisma.subject.create({
      data: {
        name: `${TAG} Subject`,
        slug: slug('subject'),
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    ids.subject = subject.id;

    // A published country to map against, and a draft one that must never leak.
    const published = await prisma.country.create({
      data: {
        name: `${TAG} Published Country`,
        slug: slug('country-published'),
        iso2Code: 'Q1',
        iso3Code: 'QQ1',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    const draftCountry = await prisma.country.create({
      data: {
        name: `${TAG} Draft Country`,
        slug: slug('country-draft'),
        iso2Code: 'Q2',
        iso3Code: 'QQ2',
        status: 'DRAFT',
      },
    });
    ids.country = published.id;
    ids.draftCountry = draftCountry.id;

    const course = async (name: string, status: string) =>
      prisma.course.create({
        data: {
          subjectId: subject.id,
          courseLevelId: level.id,
          name: `${TAG} ${name}`,
          slug: slug(name),
          status,
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
          studyModes: { create: { studyModeId: mode.id } },
        },
      });

    // The case this change exists for: published, mapped, no citation.
    const uncited = await course('uncited', 'PUBLISHED');
    await prisma.countryCourse.create({
      data: {
        countryId: published.id,
        courseId: uncited.id,
        status: 'ACTIVE',
        availabilityStatus: 'AVAILABLE',
      },
    });

    // Everything below must still be excluded.
    const softDeletedMapping = await course('deleted-mapping', 'PUBLISHED');
    await prisma.countryCourse.create({
      data: {
        countryId: published.id,
        courseId: softDeletedMapping.id,
        status: 'ACTIVE',
        availabilityStatus: 'AVAILABLE',
        deletedAt: new Date(),
      },
    });

    const inactiveMapping = await course('inactive-mapping', 'PUBLISHED');
    await prisma.countryCourse.create({
      data: {
        countryId: published.id,
        courseId: inactiveMapping.id,
        status: 'INACTIVE',
        availabilityStatus: 'AVAILABLE',
      },
    });

    const unavailable = await course('unavailable', 'PUBLISHED');
    await prisma.countryCourse.create({
      data: {
        countryId: published.id,
        courseId: unavailable.id,
        status: 'ACTIVE',
        availabilityStatus: 'NOT_AVAILABLE',
      },
    });

    const draftCourse = await course('draft-course', 'DRAFT');
    await prisma.countryCourse.create({
      data: {
        countryId: published.id,
        courseId: draftCourse.id,
        status: 'ACTIVE',
        availabilityStatus: 'AVAILABLE',
      },
    });

    const unpublishedCountry = await course('unpublished-country', 'PUBLISHED');
    await prisma.countryCourse.create({
      data: {
        countryId: draftCountry.id,
        courseId: unpublishedCountry.id,
        status: 'ACTIVE',
        availabilityStatus: 'AVAILABLE',
      },
    });

    // A published course with no mapping at all is not a catalogue entry.
    await course('unmapped', 'PUBLISHED');
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  async function cleanup() {
    const courses = await prisma.course.findMany({
      where: { slug: { startsWith: `${TAG}-` } },
      select: { id: true },
    });
    if (courses.length) {
      const courseIds = courses.map((row) => row.id);
      await prisma.countryCourse.deleteMany({
        where: { courseId: { in: courseIds } },
      });
      await prisma.courseStudyMode.deleteMany({
        where: { courseId: { in: courseIds } },
      });
      await prisma.course.deleteMany({ where: { id: { in: courseIds } } });
    }
    await prisma.subject.deleteMany({
      where: { slug: { startsWith: `${TAG}-` } },
    });
    await prisma.country.deleteMany({
      where: { slug: { startsWith: `${TAG}-` } },
    });
  }

  async function listAll(): Promise<string[]> {
    const seen: string[] = [];
    for (let page = 1; page <= 40; page += 1) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses?page=${page}&pageSize=100`)
        .expect(200);
      const slugs = courseSlugs(response);
      seen.push(...slugs);
      if (slugs.length < 100) break;
    }
    return seen;
  }

  it('publishes a mapped course that has no source reference or verified date', async () => {
    expect(await listAll()).toContain(slug('uncited'));
  });

  it('keeps that course out of the catalogue when nothing maps it', async () => {
    expect(await listAll()).not.toContain(slug('unmapped'));
  });

  it.each([
    ['a soft-deleted mapping', 'deleted-mapping'],
    ['an inactive mapping', 'inactive-mapping'],
    ['a mapping marked not available', 'unavailable'],
    ['a draft course', 'draft-course'],
    ['a mapping to an unpublished country', 'unpublished-country'],
  ])('still excludes %s', async (_label, name) => {
    expect(await listAll()).not.toContain(slug(name));
  });

  it('filters the uncited course by its country like any other', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/courses?country=${slug('country-published')}&pageSize=100`)
      .expect(200);
    expect(courseSlugs(response)).toContain(slug('uncited'));
  });
});
