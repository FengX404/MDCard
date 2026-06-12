import './analytics.js';
import { dom } from './dom.js';
import { store, writeDomSettings } from './store.js';
import { loadFromHash, restore } from './storage.js';
import { renderPalettes, renderLayouts, initCollapsibleGroups, applyPalette } from './ui/drawer.js';
import { refresh } from './ui/preview.js';
import { bindEvents } from './ui/toolbar.js';
import { initSheet } from './ui/sheet.js';
import { t, init as initI18n, onLocaleChange, getLocale } from './i18n.js';
import { loadDraft, getCurrentId, setCurrentId } from './draft.js';
import { importImages } from './image-upload.js';
import { showToast } from './toast.js';

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

    document.documentElement.setAttribute('data-appearance', 'system');

    if (!fromHash && !fromLocal) {
        applyPalette(store.paletteIdx);
    }

    writeDomSettings();
    renderPalettes();
    renderLayouts();
    initCollapsibleGroups();

    if (!fromHash && !fromLocal) {
        // Check for emergency draft from beforeunload crash recovery
        const emergencyMd = localStorage.getItem('mdcard-emergency-draft');
        if (emergencyMd) {
            const emergencyId = localStorage.getItem('mdcard-emergency-draft-id');
            localStorage.removeItem('mdcard-emergency-draft');
            localStorage.removeItem('mdcard-emergency-draft-id');
            dom.markdown.value = emergencyMd;
            if (emergencyId) setCurrentId(+emergencyId || null);
            showToast(t('draft.restored', { title: t('draft.emergency') }));
            refresh();
        } else {
            const draftId = getCurrentId();
            if (draftId != null) {
                loadDraft(draftId).then(draft => {
                    if (draft) {
                        importImages(draft.images);
                        dom.markdown.value = draft.md;
                        showToast(t('draft.restored', { title: draft.title }));
                        refresh();
                        return;
                    }
                    dom.markdown.value = t('demo.content');
                    refresh();
                });
            } else {
                dom.markdown.value = t('demo.content');
                refresh();
            }
        }
    } else {
        refresh();
    }

    onLocaleChange(() => {
        renderPalettes();
        renderLayouts();
        if (dom.markdown.value === t('demo.content')) {
            dom.markdown.value = t('demo.content');
        }
        // Update format dropdown button label
        const fmt = dom.format.value;
        dom.formatDropdown.querySelectorAll('.mc__format-option').forEach(o => {
            if (o.dataset.format === fmt) dom.formatLabel.textContent = o.textContent;
        });
        // Update language dropdown button label
        const locale = getLocale();
        dom.langDropdown.querySelectorAll('.mc__lang-option').forEach(o => {
            if (o.dataset.lang === locale) dom.langLabel.textContent = o.textContent;
        });
        // Update mobile overflow language label
        const mobileLangLabel = document.getElementById('mc-lang-label-m');
        const mobileLangOpts = document.getElementById('mc-lang-opts-m');
        if (mobileLangLabel && mobileLangOpts) {
            mobileLangOpts.querySelectorAll('.mc__lang-option').forEach(o => {
                o.classList.toggle('active', o.dataset.lang === locale);
                if (o.dataset.lang === locale) mobileLangLabel.textContent = o.textContent;
            });
        }
        refresh();
    });

    bindEvents();
    initSheet();
}

init();
