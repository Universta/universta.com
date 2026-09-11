import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/admin-auth';
import { apiBaseUrl } from './helpers/e2e-urls';
import {
  acceptanceCountryName,
  acceptanceRunId,
  acceptanceSlugPrefix,
} from './helpers/acceptance-run';

/**
 * Work and visa values entered on an existing Country vanished when it was
 * reopened.
 *
 * The cause was that the country's own Save wrote the country row, the
 * editorial records and the SEO, but not the profile cards: that flush ran only
 * on the save that created the row. An author who filled in Work and visa and
 * pressed the button at the end of the form was told the country saved, and the
 * card was dropped without a word.
 *
 * The unit suite pins the same sequence against a fake API. This pins it against
 * the real one, because "the value is in the database afterwards" is the part
 * that actually matters and the part a fake cannot prove.
 */

const runId = acceptanceRunId();
const COUNTRY_NAME = `${acceptanceCountryName(runId)} Profiles`;
const COUNTRY_SLUG = `${acceptanceSlugPrefix(runId)}profiles`;

const SUMMARY = 'Stamp 2 permits twenty hours a week during term time.';
const SUMMARY_EDITED = 'Twenty hours a week in term, forty in vacation.';

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

/** What the API is actually holding, read straight from it rather than from
 * the screen that just claimed to have written it. */
async function storedWork(): Promise<Record<string, unknown> | null> {
  return withAdminApi(async (api, headers) => {
    const response = await api.get(
      `/api/v1/admin/countries/${countryId}/profiles`,
      { headers },
    );
    const body = (await response.json()) as {
      data?: { work?: Record<string, unknown> | null };
    };
    return body.data?.work ?? null;
  });
}


/** Waits for the form to report the save, and fails with the reason when the
 * form reports a problem instead -- a bare timeout on the success notice says
 * only "nothing happened", which is the least useful thing it could say. */
async function savedOrExplained(page: Page) {
  /* Both are looked at by their text, not merely their presence: the form
   * keeps empty status and alert regions mounted so a screen reader hears an
   * announcement when one fills, and treating an empty one as an answer made
   * this helper report a rejection that never happened. */
  const textOf = async (role: 'status' | 'alert') => {
    const node = page.getByRole(role).first();
    if (!(await node.count())) return '';
    return (await node.innerText()).trim();
  };
  let failure = '';
  await expect
    .poll(
      async () => {
        if (await textOf('status')) return 'saved';
        failure = await textOf('alert');
        return failure ? 'rejected' : 'pending';
      },
      { timeout: 30_000 },
    )
    .not.toBe('pending');
  if (failure) throw new Error(`the form rejected the save: ${failure}`);
}

function card(page: Page, heading: string) {
  return page
    .getByRole('heading', { level: 3, name: heading, exact: true })
    .locator('xpath=..');
}

test.describe.serial('country profile cards are written by the country save', () => {
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

  test('creates the country the rest of this file edits', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');
    await page.getByLabel(/^Country name/).fill(COUNTRY_NAME);
    await page.getByLabel('Slug', { exact: true }).first().fill(COUNTRY_SLUG);
    /* The cost card has no currency of its own -- it inherits the Country's,
     * and the API refuses a cost profile without one. An author sets this in
     * Identity & listing, so the fixture does too. */
    await page.getByLabel('Currency code').selectOption('EUR');
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page).toHaveURL(/\/countries\/[a-f0-9-]+$/, { timeout: 30_000 });
    countryId = page.url().split('/').pop() ?? '';
    expect(countryId).toBeTruthy();
  });

  test('writes Work and visa through the form Save, and keeps it on reopen', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto(`/countries/${countryId}`);

    const work = card(page, 'Work and visa');
    await expect(work.getByLabel(/^Visa type/)).toBeVisible({ timeout: 30_000 });

    /* The four kinds the bug report named: text, a checkbox, a number and a
     * long rich-text summary. */
    await work.getByLabel(/^Visa type/).fill('Student Visa (S)');
    await work.getByLabel(/^Part-time work allowed during study/).check();
    await work.getByLabel(/^Work hours per week/).fill('20');
    const summary = work.getByRole('textbox', {
      name: 'Part-time work summary',
      exact: true,
    });
    await summary.click();
    await page.keyboard.type(SUMMARY);

    /* Deliberately not the card's own Save. This is the button that says it
     * saves the country, and it is the one that used to drop the card. */
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await savedOrExplained(page);

    const stored = await storedWork();
    expect(stored?.visaType).toBe('Student Visa (S)');
    expect(stored?.partTimeAllowed).toBe(true);
    expect(String(stored?.partTimeHoursPerWeek)).toBe('20');
    expect(String(stored?.partTimeSummary)).toContain('twenty hours a week');

    // Reopen from scratch: this is where the values used to be gone.
    await page.reload();
    const reopened = card(page, 'Work and visa');
    await expect(reopened.getByLabel(/^Visa type/)).toHaveValue('Student Visa (S)', {
      timeout: 30_000,
    });
    await expect(
      reopened.getByLabel(/^Part-time work allowed during study/),
    ).toBeChecked();
    await expect(reopened.getByLabel(/^Work hours per week/)).toHaveValue('20');
    await expect(
      reopened.getByRole('textbox', { name: 'Part-time work summary', exact: true }),
    ).toContainText('twenty hours a week');
  });

  test('keeps a second edit made after the reopen', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/countries/${countryId}`);

    const work = card(page, 'Work and visa');
    await expect(work.getByLabel(/^Visa type/)).toHaveValue('Student Visa (S)', {
      timeout: 30_000,
    });

    await work.getByLabel(/^Visa type/).fill('e-Student Visa');
    const summary = work.getByRole('textbox', {
      name: 'Part-time work summary',
      exact: true,
    });
    await summary.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type(SUMMARY_EDITED);

    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await savedOrExplained(page);

    const stored = await storedWork();
    expect(stored?.visaType).toBe('e-Student Visa');
    expect(String(stored?.partTimeSummary)).toContain('forty in vacation');

    await page.reload();
    await expect(card(page, 'Work and visa').getByLabel(/^Visa type/)).toHaveValue(
      'e-Student Visa',
      { timeout: 30_000 },
    );
  });

  test('writes the other profile cards the same way', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/countries/${countryId}`);

    const cost = card(page, 'Cost and budget');
    await expect(cost.getByLabel(/^Tuition minimum/)).toBeVisible({ timeout: 30_000 });
    await cost.getByLabel(/^Tuition minimum/).fill('25000');
    await card(page, 'English requirements')
      .getByLabel(/^IELTS requirement/)
      .selectOption('OPTIONAL');
    await card(page, 'Statistics')
      .getByLabel(/^International students/)
      .fill('58134');

    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await savedOrExplained(page);

    const profiles = await withAdminApi(async (api, headers) => {
      const response = await api.get(
        `/api/v1/admin/countries/${countryId}/profiles`,
        { headers },
      );
      return (
        (await response.json()) as {
          data?: Record<string, Record<string, unknown> | null>;
        }
      ).data;
    });

    expect(String(profiles?.cost?.tuitionMin)).toBe('25000');
    expect(profiles?.language?.ieltsRequirement).toBe('OPTIONAL');
    expect(String(profiles?.statistics?.internationalStudentsCount)).toBe('58134');
  });

  test('offers no source reference or verification date on any card', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto(`/countries/${countryId}`);
    await expect(
      card(page, 'Work and visa').getByLabel(/^Visa type/),
    ).toBeVisible({ timeout: 30_000 });

    for (const heading of [
      'Cost and budget',
      'Work and visa',
      'English requirements',
      'Statistics',
    ]) {
      const section = card(page, heading);
      await expect(section.getByLabel(/^Source reference/)).toHaveCount(0);
      await expect(section.getByLabel(/^Verified on/)).toHaveCount(0);
    }
  });
});
