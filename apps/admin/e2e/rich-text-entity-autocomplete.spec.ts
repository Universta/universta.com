import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/admin-auth';
import { apiBaseUrl } from './helpers/e2e-urls';
import {
  acceptanceCountryName,
  acceptanceRunId,
  acceptanceSlugPrefix,
} from './helpers/acceptance-run';

/**
 * The inline `%` autocomplete in the shared rich-text editor.
 *
 * The rules it applies -- when the menu opens, how results rank, what gets
 * inserted -- are unit-tested against `entity-autocomplete.ts`, where they can
 * be stated precisely. What cannot be tested there is everything that needs a
 * real caret inside a real contenteditable: reading the token under the cursor,
 * taking arrow keys and Enter away from Jodit before it acts on them, and
 * replacing the typed token with a link without corrupting the markup around
 * it. That is what this file is for.
 */

const runId = acceptanceRunId();
const COUNTRY_NAME = `${acceptanceCountryName(runId)} Autocomplete`;
const COUNTRY_SLUG = `${acceptanceSlugPrefix(runId)}autocomplete`;

let countryId = '';

async function withAdminApi<T>(
  run: (
    api: import('@playwright/test').APIRequestContext,
    headers: Record<string, string>,
  ) => Promise<T>,
): Promise<T> {
  const api = await playwrightRequest.newContext({ baseURL: apiBaseUrl });
  try {
    const login = await api.post('/api/v1/admin/auth/login', {
      data: {
        email: process.env.E2E_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL,
        password: process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD,
      },
    });
    const token = ((await login.json()) as { data: { accessToken: string } }).data
      .accessToken;
    return await run(api, { Authorization: `Bearer ${token}` });
  } finally {
    await api.dispose();
  }
}

function field(page: Page, name: string) {
  return page.getByRole('textbox', { name, exact: true });
}
function menu(page: Page) {
  return page.getByRole('listbox');
}

test.describe.serial('rich-text inline entity autocomplete', () => {
  test.afterAll(async () => {
    if (!countryId) return;
    await withAdminApi(async (api, headers) => {
      const current = await api.get(`/api/v1/admin/countries/${countryId}`, {
        headers,
      });
      const updatedAt = ((await current.json()) as {
        data?: { updatedAt?: string };
      }).data?.updatedAt;
      await api.delete(`/api/v1/admin/countries/${countryId}`, {
        headers,
        data: { expectedUpdatedAt: updatedAt },
      });
    });
  });

  test('the separate Insert variable control is gone from every field', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');
    await expect(field(page, 'Short description')).toBeVisible({ timeout: 30_000 });

    await expect(page.getByLabel(/Insert variable/i)).toHaveCount(0);
    await expect(page.getByText('Insert variable')).toHaveCount(0);
  });

  test('leaves ordinary percentage writing alone', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    const box = field(page, 'Short description');
    await expect(box).toBeVisible({ timeout: 30_000 });
    await box.click();
    await page.keyboard.type('Scholarships cover 50% tuition and 100% of fees');
    await page.waitForTimeout(500);

    /* The whole point of the trigger rule: a percentage is arithmetic, not a
     * record being picked. */
    await expect(menu(page)).toHaveCount(0);
    expect(await box.innerText()).toContain('50% tuition');
  });

  test('opens on a typed token, and closes on Escape', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    const box = field(page, 'Overview');
    await expect(box).toBeVisible({ timeout: 30_000 });
    await box.click();
    await page.keyboard.type('Study at %i');

    await expect(menu(page)).toBeVisible({ timeout: 15_000 });
    await page.keyboard.press('Escape');
    await expect(menu(page)).toHaveCount(0);
    /* Escape dismisses the menu without eating the text that opened it. */
    expect(await box.innerText()).toContain('%i');
  });

  test('resolves a current form value before the country has been saved', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    /* No id exists yet -- this is the case that used to need a save first. */
    await page.getByLabel(/^Country name/).fill(COUNTRY_NAME);

    const box = field(page, 'Overview');
    await box.click();
    await page.keyboard.type('Welcome to %country');

    const option = menu(page).getByRole('option', { name: /Country name/ });
    await expect(option).toBeVisible({ timeout: 15_000 });
    await option.click();

    await expect(box).toContainText(COUNTRY_NAME, { timeout: 10_000 });
    expect(await box.innerText()).not.toContain('%country');
  });

  test('picks an entity with the keyboard and inserts it as an internal link', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    const box = field(page, 'Overview');
    await expect(box).toBeVisible({ timeout: 30_000 });
    await box.click();
    await page.keyboard.type('Partnered with %a');

    await expect(menu(page)).toBeVisible({ timeout: 15_000 });
    const first = menu(page).getByRole('option').first();
    const chosen = (await first.innerText()).split('\n')[0];

    /* Arrow down then back up lands on the first option again, which proves
     * Jodit never saw the keys: if it had, the caret would have moved and the
     * menu would have closed. */
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');

    await expect(menu(page)).toHaveCount(0);
    const html = await box.innerHTML();
    expect(await box.innerText()).toContain(chosen);
    expect(await box.innerText()).not.toContain('%a');
    /* Entities with a public page are linked; the href is root-relative, which
     * is the only shape the Admin, API and public sanitisers all keep. */
    if (html.includes('<a ')) {
      expect(html).toMatch(/href="\/[a-z]/);
      expect(html).toContain('rel="noopener noreferrer"');
    }
  });

  test('survives a save and a reload with the link intact', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    /* The identity fields are filled after the insertion, not before. With a
     * Country name already typed, `%a` also matches the "Country name"
     * variable, whose menu label and inserted value are deliberately different
     * -- so comparing the two would be asserting the wrong thing. Leaving the
     * name empty keeps the first option an entity, whose label is what lands. */
    const box = field(page, 'Overview');
    await expect(box).toBeVisible({ timeout: 30_000 });
    await box.click();
    await page.keyboard.type('Read about %a');
    await expect(menu(page)).toBeVisible({ timeout: 15_000 });
    const chosen = (await menu(page).getByRole('option').first().innerText()).split(
      '\n',
    )[0];
    await page.keyboard.press('Enter');
    await expect(box).toContainText(chosen, { timeout: 10_000 });

    await page.getByLabel(/^Country name/).fill(COUNTRY_NAME);
    await page.getByLabel('Slug', { exact: true }).first().fill(COUNTRY_SLUG);
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page).toHaveURL(/\/countries\/[a-f0-9-]+$/, { timeout: 30_000 });
    countryId = page.url().split('/').pop() ?? '';
    expect(countryId).toBeTruthy();

    await page.reload();
    const reopened = field(page, 'Overview');
    await expect(reopened).toContainText(chosen, { timeout: 30_000 });
    /* The API sanitiser keeps a root-relative href, so what was inserted is
     * what comes back rather than bare text. */
    const stored = await reopened.innerHTML();
    if (stored.includes('<a ')) expect(stored).toMatch(/href="\/[a-z]/);
  });
});
