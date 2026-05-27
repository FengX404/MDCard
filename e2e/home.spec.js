import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MDCard/);
  });

  test('should render editor with placeholder', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('[data-i18n-placeholder="editor.placeholder"]');
    await expect(editor).toBeVisible();
  });

  test('should render demo content on load', async ({ page }) => {
    await page.goto('/');
    const preview = page.locator('#mc-preview');
    await expect(preview).toBeVisible();
    await expect(preview.locator('.mc__card')).not.toHaveCount(0);
  });

  test('should have language switcher with all options', async ({ page }) => {
    await page.goto('/');
    const langSwitch = page.locator('#mc-lang');
    await expect(langSwitch).toBeVisible();
    const options = await langSwitch.locator('option').allTextContents();
    expect(options).toContain('English');
    expect(options).toContain('简体中文');
    expect(options).toContain('繁體中文');
    expect(options).toContain('日本語');
    expect(options).toContain('한국어');
  });

  test('should have theme toggle buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-i18n-title="toolbar.dark"]')).toBeVisible();
    await expect(page.locator('[data-i18n-title="toolbar.light"]')).toBeVisible();
    await expect(page.locator('[data-i18n-title="toolbar.system"]')).toBeVisible();
  });
});