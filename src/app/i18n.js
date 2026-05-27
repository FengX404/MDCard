import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';
import zhTW from '../locales/zh-TW.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';

const LOCALES = { en, 'zh-CN': zhCN, 'zh-TW': zhTW, ja, ko };
const SUPPORTED = Object.keys(LOCALES);
const STORAGE_KEY = 'mdcard-locale';

let currentLocale = 'en';
let messages = LOCALES.en;
let changeListeners = [];

function detectLocale() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    const nav = navigator.language;
    if (SUPPORTED.includes(nav)) return nav;

    const prefix = nav.split('-')[0];
    for (const s of SUPPORTED) {
        if (s.startsWith(prefix)) return s;
    }

    return 'en';
}

/**
 * Switch the active locale at runtime.
 * Updates `<html lang>`, re-applies translations to the DOM,
 * and notifies registered change listeners.
 * @param {string} locale - Locale code (e.g. 'en', 'zh-CN', 'ja', 'ko')
 */
export function setLocale(locale) {
    if (!SUPPORTED.includes(locale)) return;
    currentLocale = locale;
    messages = LOCALES[locale];
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    applyToDOM();
    changeListeners.forEach((fn) => fn(locale));
}

/**
 * Get the currently active locale code.
 * @returns {string} Current locale (e.g. 'en')
 */
export function getLocale() {
    return currentLocale;
}

/**
 * Register a callback to be invoked when the locale changes.
 * @param {(locale: string) => void} fn - Callback receiving the new locale code
 */
export function onLocaleChange(fn) {
    changeListeners.push(fn);
}

/**
 * Translate a dot-separated key path into a localized string.
 * Supports `{key}` placeholder interpolation via the `vars` parameter.
 * @param {string} key - Dot-separated key path (e.g. 'status.cards')
 * @param {Record<string, string|number>} [vars] - Optional placeholder values
 * @returns {string} Translated string, or the original key if not found
 *
 * @example
 * t('status.cards', { count: 5 }) // → '5 cards'
 */
export function t(key, vars) {
    const keys = key.split('.');
    let val = messages;
    for (const k of keys) {
        if (val == null) return key;
        val = val[k];
    }
    if (typeof val !== 'string') return key;
    if (vars) {
        return val.replace(/\{(\w+)\}/g, (_, name) =>
            vars[name] != null ? vars[name] : `{${name}}`,
        );
    }
    return val;
}

/**
 * Walk the DOM and update all elements with `data-i18n`,
 * `data-i18n-placeholder`, and `data-i18n-title` attributes.
 * Also sets `document.title` to the localized title.
 */
export function applyToDOM() {
    document.title = t('title');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        el.title = t(el.dataset.i18nTitle);
    });
}

/**
 * Initialize the i18n system.
 * Detects the best locale from localStorage / browser language,
 * applies translations to the DOM, and sets `<html lang>`.
 * Call once on application startup.
 */
export function init() {
    currentLocale = detectLocale();
    messages = LOCALES[currentLocale];
    document.documentElement.lang = currentLocale;
    applyToDOM();
}

export { SUPPORTED, LOCALES };