import { expect, request as playwrightRequest, test, type Page } from '@playwright/test';
import { loginAsAdmin } from './helpers/admin-auth';
import { apiBaseUrl } from './helpers/e2e-urls';
import { acceptanceCountryName, acceptanceRunId, acceptanceSlugPrefix } from './helpers/acceptance-run';

/**
 * Pasting into a rich-text field used to destroy what was pasted.
 *
 * The editor was given the stored tag set as Jodit's `cleanHTML.allowTags`,
 * and Jodit enforces that by deleting any element outside the list together
 * with everything inside it. Every real paste arrives wrapped in markup the
 * stored set does not contain -- a `div`, a `span`, a `meta` charset -- so
 * roughly 300ms after pasting, the cleanup pass removed the wrapper and took
 * the author's text with it. Content that happened to be inside the subset
 * survived, which is why it looked intermittent rather than total.
 *
 * These paste the shapes a person actually pastes, and wait well past that
 * cleanup pass before believing the result.
 */

const runId = acceptanceRunId();
const COUNTRY_NAME = `${acceptanceCountryName(runId)} Paste`;
const COUNTRY_SLUG = `${acceptanceSlugPrefix(runId)}paste`;

const REAL_WORLD =
  '<meta charset="utf-8"><div style="font-family:Arial"><span style="color:#111">Pasted <b>formatted</b> content from a real document.</span></div>';
const REAL_WORLD_TEXT = 'Pasted formatted content from a real document.';

/** Long enough that the cleanup pass has real work to do. */
const LARGE = Array.from({ length: 120 }, (_, i) => `<p>Paragraph number ${i + 1}.</p>`).join('');

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

async function withAdminApi<T>(
  run: (api: import('@playwright/test').APIRequestContext, headers: Record<string, string>) => Promise<T>,
): Promise<T> {
  const api = await playwrightRequest.newContext({ baseURL: apiBaseUrl });
  try {
    const login = await api.post('/api/v1/admin/auth/login', {
      data: {
        email: process.env.E2E_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL,
        password: process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD,
      },
    });
    const token = ((await login.json()) as { data: { accessToken: string } }).data.accessToken;
    return await run(api, { Authorization: `Bearer ${token}` });
  } finally {
    await api.dispose();
  }
}

async function paste(page: Page, label: string, html: string, plain: string) {
  const box = page.getByRole('textbox', { name: label, exact: true });
  await expect(box).toBeVisible({ timeout: 30_000 });
  await box.click();
  await page.evaluate(
    async ([source, text]) => {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([source], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
    },
    [html, plain],
  );
  await page.keyboard.press('ControlOrMeta+v');
  return box;
}

/** Jodit's cleanup pass runs on a 300ms timer; this is what the old bug needed
 * to show itself, and what any future regression would need too. */
async function settle(page: Page) {
  await page.waitForTimeout(1500);
}

let countryId = '';

test.describe.serial('country editor rich-text paste', () => {
  test.afterAll(async () => {
    if (!countryId) return;
    await withAdminApi(async (api, headers) => {
      const current = await api.get(`/api/v1/admin/countries/${countryId}`, { headers });
      const updatedAt = ((await current.json()) as { data?: { updatedAt?: string } }).data?.updatedAt;
      await api.delete(`/api/v1/admin/countries/${countryId}`, {
        headers,
        data: { expectedUpdatedAt: updatedAt },
      });
    });
  });

  test('keeps every shape of paste, and still drops unsafe markup', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    const cases: Array<[string, string, string, string | null]> = [
      ['plain text', 'Just some plain pasted text.', 'Just some plain pasted text.', null],
      ['subset markup', '<p>Kept <strong>bold</strong> words.</p>', 'Kept bold words.', '<strong>'],
      ['a real document', REAL_WORLD, REAL_WORLD_TEXT, '<strong>'],
    ];

    for (const [what, html, text, keepsTag] of cases) {
      const box = await paste(page, 'Short description', html, text);
      await settle(page);
      expect(await box.innerText(), `${what} should survive the cleanup pass`).toContain(text);
      if (keepsTag) expect(await box.innerHTML()).toContain(keepsTag);
      await box.press('ControlOrMeta+a');
      await box.press('Backspace');
    }

    // Sanitisation is unchanged: the text is kept, the dangerous parts are not.
    const unsafe = await paste(
      page,
      'Short description',
      '<div>Keep this<script>alert(1)</script><img src="javascript:alert(1)"></div>',
      'Keep this',
    );
    await settle(page);
    expect(await unsafe.innerText()).toContain('Keep this');
    const html = await unsafe.innerHTML();
    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
  });

  test('keeps a large paste through blur and a move to another field', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    const box = await paste(page, 'Overview', LARGE, 'Paragraph number 1.');
    await settle(page);
    expect(await box.innerText()).toContain('Paragraph number 120.');

    await page.getByLabel('Tagline').click();
    await settle(page);
    expect(await box.innerText(), 'blur must not discard it').toContain('Paragraph number 120.');
  });

  test('carries pasted content through a save and back on reload', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/countries/new');

    await page.getByLabel(/^Country name/).fill(COUNTRY_NAME);
    await page.getByLabel('Slug', { exact: true }).first().fill(COUNTRY_SLUG);
    await paste(page, 'Short description', REAL_WORLD, REAL_WORLD_TEXT);
    await paste(page, 'Overview', '<div><span>An overview <b>pasted</b> in.</span></div>', 'An overview pasted in.');
    await settle(page);

    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    await expect(page).toHaveURL(/\/countries\/[a-f0-9-]+$/, { timeout: 30_000 });
    countryId = page.url().split('/').pop() ?? '';
    expect(countryId).toBeTruthy();

    await page.reload();
    // Stored content must be there when the editor mounts, and stay there.
    const short = page.getByRole('textbox', { name: 'Short description', exact: true });
    await expect(short).toContainText(REAL_WORLD_TEXT, { timeout: 30_000 });
    await settle(page);
    expect(await short.innerText()).toContain(REAL_WORLD_TEXT);
    expect(await page.getByRole('textbox', { name: 'Overview', exact: true }).innerText()).toContain(
      'An overview pasted in.',
    );
  });

  test('behaves the same in a profile note and an FAQ answer', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/countries/${countryId}`);

    const notes = await paste(page, 'Tuition notes', REAL_WORLD, REAL_WORLD_TEXT);
    await settle(page);
    expect(await notes.innerText()).toContain(REAL_WORLD_TEXT);

    await page.getByRole('button', { name: /^\+ Add FAQ$/ }).click();
    const answer = await paste(page, 'Answer', REAL_WORLD, REAL_WORLD_TEXT);
    await settle(page);
    expect(await answer.innerText()).toContain(REAL_WORLD_TEXT);
  });
});
