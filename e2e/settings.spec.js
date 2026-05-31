import { test, expect } from '@playwright/test';

test.describe('Settings Panel', () => {
  test('should open style drawer', async ({ page }) => {
    await page.goto('/');
    const styleBtn = page.locator('[data-i18n="toolbar.style"]');
    await styleBtn.click();

    const drawer = page.locator('#mc-drawer');
    await expect(drawer).toBeVisible();
  });

  test('should show themes in drawer', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-i18n="toolbar.style"]').click();

    const themes = page.locator('.mc__theme-item');
    const count = await themes.count();
    expect(count).toBe(10);
  });

  test('should switch theme and update preview', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');
    await editor.fill('# Test');

    await page.locator('[data-i18n="toolbar.style"]').click();

    const firstTheme = page.locator('.mc__theme-item').first();
    await firstTheme.click();

    const card = page.locator('.mc__card').first();
    await expect(card).toBeVisible();
  });

  test('should switch template and update preview', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('textarea#mc-input');
    await editor.fill('# Test');

    await page.locator('[data-i18n="toolbar.style"]').click();

    const templates = page.locator('.mc__template-item');
    const count = await templates.count();
    expect(count).toBe(6);
  });

  test('should change aspect ratio', async ({ page }) => {
    await page.goto('/');
    const formatSelect = page.locator('#mc-format');
    await formatSelect.selectOption('square');

    const card = page.locator('.mc__card').first();
    const box = await card.boundingBox();
    if (box) {
      expect(Math.abs(box.width - box.height)).toBeLessThan(10);
    }
  });

  test('should change appearance mode', async ({ page }) => {
    await page.goto('/');

    const darkBtn = page.locator('[data-i18n-title="toolbar.dark"]');
    await darkBtn.click();

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-appearance', 'dark');
  });

  test('should have share config button', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-i18n="toolbar.style"]').click();

    const shareBtn = page.locator('[data-i18n="actions.share"]');
    await expect(shareBtn).toBeVisible();
  });

  test('should have reset button', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-i18n="toolbar.style"]').click();

    const resetBtn = page.locator('[data-i18n="actions.reset"]');
    await expect(resetBtn).toBeVisible();
  });
});