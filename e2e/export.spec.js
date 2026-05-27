import { test, expect } from '@playwright/test';

test.describe('Export', () => {
  test('should show PNG export button', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');
    await editor.fill('# Test');

    const pngBtn = page.locator('[data-i18n="actions.png"]');
    await expect(pngBtn).toBeVisible();
  });

  test('should show JPG export button', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');
    await editor.fill('# Test');

    const jpgBtn = page.locator('[data-i18n="actions.jpg"]');
    await expect(jpgBtn).toBeVisible();
  });

  test('should show copy button', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');
    await editor.fill('# Test');

    const copyBtn = page.locator('[data-i18n="actions.copy"]');
    await expect(copyBtn).toBeVisible();
  });
});