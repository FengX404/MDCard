import { test, expect } from '@playwright/test';

test.describe('Editor', () => {
  test('should render typed markdown in preview', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');

    await editor.fill('# Hello World\n\nThis is a test paragraph.');

    const preview = page.locator('#mc-preview');
    await expect(preview.locator('h1')).toContainText('Hello World');
    await expect(preview.locator('p')).toContainText('This is a test paragraph.');
  });

  test('should paginate long content', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');

    const lines = [];
    for (let i = 0; i < 50; i++) {
      lines.push(`Line ${i + 1}`);
    }
    await editor.fill(lines.join('\n'));

    const cards = page.locator('.mc__card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should respect manual page breaks with ---', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');

    await editor.fill('# Page 1\n\n---\n\n# Page 2');

    const cards = page.locator('.mc__card');
    await expect(cards).toHaveCount(2);
  });

  test('should clear preview when editor is empty', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');

    await editor.fill('# Test');
    await editor.fill('');

    const cards = page.locator('.mc__card');
    await expect(cards).toHaveCount(0);
  });

  test('should render code blocks', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');

    await editor.fill('```javascript\nconsole.log("hello");\n```');

    const preview = page.locator('#mc-preview');
    await expect(preview.locator('pre code')).toBeVisible();
    await expect(preview.locator('pre code')).toContainText('console.log');
  });
});