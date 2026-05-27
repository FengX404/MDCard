import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test('should default to browser language', async ({ page }) => {
    await page.goto('/');
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
  });

  test('should switch to Chinese Simplified', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#mc-lang', 'zh-CN');

    const title = await page.title();
    expect(title).toContain('MDCard');

    const darkBtn = page.locator('[data-i18n-title="toolbar.dark"]');
    await expect(darkBtn).toHaveAttribute('title', '深色');
  });

  test('should switch to Chinese Traditional', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#mc-lang', 'zh-TW');

    const darkBtn = page.locator('[data-i18n-title="toolbar.dark"]');
    await expect(darkBtn).toHaveAttribute('title', '深色');
  });

  test('should switch to Japanese', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#mc-lang', 'ja');

    const darkBtn = page.locator('[data-i18n-title="toolbar.dark"]');
    await expect(darkBtn).toHaveAttribute('title', 'ダーク');
  });

  test('should switch to Korean', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#mc-lang', 'ko');

    const darkBtn = page.locator('[data-i18n-title="toolbar.dark"]');
    await expect(darkBtn).toHaveAttribute('title', '다크');
  });

  test('should switch back to English', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#mc-lang', 'ko');
    await page.selectOption('#mc-lang', 'en');

    const darkBtn = page.locator('[data-i18n-title="toolbar.dark"]');
    await expect(darkBtn).toHaveAttribute('title', 'Dark');
  });

  test('should persist language preference in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#mc-lang', 'ja');
    await page.reload();

    const langSwitch = page.locator('#mc-lang');
    await expect(langSwitch).toHaveValue('ja');
  });
});