import './analytics.js';
import { dom } from './dom.js';
import { store, writeDomSettings } from './store.js';
import { loadFromHash, restore, loadAppearance } from './storage.js';
import { renderPalettes, renderTemplates } from './ui/drawer.js';
import { refresh } from './ui/preview.js';
import { setAppearance, bindEvents } from './ui/toolbar.js';
import { t, setLocale, getLocale, init as initI18n, onLocaleChange } from './i18n.js';
import './analytics.js';

marked.setOptions({ breaks: true, gfm: true });

const mdRenderer = new marked.Renderer();
mdRenderer.image = function ({ href, text }) {
    const alt = text || '';
    const src = href || '';
    return `<div class="md-img-wrap"><img src="${src}" alt="${alt}" /></div>`;
};
marked.setOptions({ renderer: mdRenderer });

function init() {
    initI18n();

    const fromHash = loadFromHash();
    const fromLocal = !fromHash && restore();

    store.appearanceMode = loadAppearance();
    setAppearance(store.appearanceMode);
    writeDomSettings();
    renderPalettes();
    renderTemplates();

    dom.langSwitch.value = getLocale();

    if (!fromHash && !fromLocal) {
        dom.markdown.value = t('demo.content');
    }

    onLocaleChange(() => {
        renderPalettes();
        renderTemplates();
        if (dom.markdown.value === t('demo.content')) {
            dom.markdown.value = t('demo.content');
        }
        refresh();
    });

    bindEvents();
    refresh();
}

init();
