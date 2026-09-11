import { InternalLinksService } from './internal-links.service';

/**
 * What the rich-text editor's `%` autocomplete is given.
 *
 * Two things are easy to get wrong here and expensive to notice later: a path
 * built for an entity that has no public page, and a city path missing the
 * country segment its route requires. Both are asserted directly.
 */

type Row = Record<string, unknown>;

function serviceWith(rows: Record<string, Row[]>) {
  const prisma = Object.fromEntries(
    Object.entries(rows).map(([model, data]) => [
      model,
      { findMany: jest.fn().mockResolvedValue(data) },
    ]),
  );
  /* Models the search does not need for a given case answer with nothing, so
   * each test states only the rows it is about. */
  const handler: ProxyHandler<Record<string, unknown>> = {
    get: (target, key: string) =>
      target[key] ?? { findMany: jest.fn().mockResolvedValue([]) },
  };
  return new InternalLinksService(new Proxy(prisma, handler) as never);
}

describe('editor entity suggestions', () => {
  it('builds a public path only for entities that have a page', async () => {
    const service = serviceWith({
      university: [
        { id: 'u1', slug: 'iit-delhi', name: 'IIT Delhi', countryId: 'in' },
      ],
      continent: [{ id: 'c1', slug: 'asia', name: 'Asia' }],
      subSubject: [{ id: 's1', slug: 'data-science', name: 'Data Science' }],
    });

    const rows = await service.editorEntities('a');
    const byKind = Object.fromEntries(rows.map((row) => [row.kind, row]));

    expect(byKind.university.path).toBe('/universities/iit-delhi');
    /* No route exists for either on its own, so neither may be linked. */
    expect(byKind.continent.path).toBeNull();
    expect(byKind.specialization.path).toBeNull();
  });

  it('gives a city the country segment its route needs', async () => {
    const service = serviceWith({
      city: [
        {
          id: 'city1',
          slug: 'new-delhi',
          name: 'New Delhi',
          countryId: 'in',
          country: { slug: 'india' },
        },
      ],
    });

    const [city] = await service.editorEntities('delhi');
    expect(city.path).toBe('/study-in/india/new-delhi');
  });

  it('refuses to link a city whose country is missing rather than guess', async () => {
    const service = serviceWith({
      city: [
        {
          id: 'city1',
          slug: 'orphan',
          name: 'Orphan',
          countryId: null,
          country: null,
        },
      ],
    });

    const [city] = await service.editorEntities('orphan');
    expect(city.path).toBeNull();
  });

  it('flags the records belonging to the country being edited', async () => {
    const service = serviceWith({
      university: [
        { id: 'u1', slug: 'iit-delhi', name: 'IIT Delhi', countryId: 'in' },
        { id: 'u2', slug: 'trinity', name: 'Trinity', countryId: 'ie' },
      ],
      country: [{ id: 'in', slug: 'india', name: 'India' }],
    });

    const rows = await service.editorEntities('i', 'in');
    const universities = rows.filter((row) => row.kind === 'university');

    expect(universities.find((row) => row.id === 'u1')?.related).toBe(true);
    expect(universities.find((row) => row.id === 'u2')?.related).toBe(false);
    /* The country being edited is related to itself, so `%india` offers it
     * ahead of every other country. */
    expect(rows.find((row) => row.kind === 'country')?.related).toBe(true);
  });

  it('names the kind so the menu can say what a result is', async () => {
    const service = serviceWith({
      scholarship: [{ id: 's1', slug: 'iccr', title: 'ICCR Scholarship' }],
    });

    const [row] = await service.editorEntities('iccr');
    expect(row.label).toBe('ICCR Scholarship');
    expect(row.detail).toBe('Scholarship');
    expect(row.path).toBe('/scholarships/iccr');
  });
});
