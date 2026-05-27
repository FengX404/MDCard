import TEMPLATES, { DEFAULT_TEMPLATE } from '../templates.js';
import { DEFAULTS, levelToValue } from '../config.js';
import { createDefaults } from '../settings.js';
import { renderToImage, triggerDownload, dataUrlToBlob } from '../renderer.js';
import { showToast } from '../toast.js';
import { setupImageUpload } from '../image-upload.js';
import { setLocale, t } from '../i18n.js';
import { dom } from '../dom.js';
import { store, readDomSettings, writeDomSettings } from '../store.js';
import { renderPalettes, renderTemplates, openDrawer, closeDrawer } from './drawer.js';
import { refresh } from './preview.js';
import { persist, saveAppearance } from '../storage.js';
import JSZip from 'jszip';

let debounceId = 0;

function debounce(fn, ms) {
    return (...args) => {
        clearTimeout(debounceId);
        debounceId = setTimeout(() => fn(...args), ms);
    };
}

export async function exportAll(kind) {
    const cards = dom.cards.querySelectorAll('.mc__card');
    if (!cards.length) return;

    dom.exportPng.disabled = true;
    dom.exportJpg.disabled = true;
    dom.status.textContent = t('status.generating');

    const fmt = dom.format.value;
    const ts = Date.now();

    try {
        const images = [];
        for (let i = 0; i < cards.length; i++) {
            const url = await renderToImage(cards[i], fmt, kind);
            images.push({ url, name: `mdcard-${i + 1}-${ts}.${kind}` });
            if (i < cards.length - 1) await new Promise(r => setTimeout(r, 100));
        }

        if (images.length <= 2) {
            for (const img of images) {
                triggerDownload(img.url, img.name);
                await new Promise(r => setTimeout(r, 300));
            }
        } else {
            const zip = new JSZip();
            for (const img of images) {
                zip.file(img.name, dataUrlToBlob(img.url));
            }
            const blob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(blob);
            triggerDownload(zipUrl, `mdcard-${ts}.zip`);
            setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
        }

        showToast(t('toast.exportSuccess', { count: images.length, format: kind.toUpperCase() }));
    } catch (e) {
        console.error(e);
        showToast(t('toast.exportFail'));
    }

    dom.exportPng.disabled = false;
    dom.exportJpg.disabled = false;
    dom.status.textContent = t('status.cards', { count: cards.length });
}

export function resetAll() {
    store.opts = createDefaults();
    store.paletteIdx = 7;
    store.templateId = DEFAULT_TEMPLATE;
    writeDomSettings();
    renderPalettes();
    renderTemplates();
    refresh();
    showToast(t('toast.resetDone'));
}

export function shareConfig() {
    readDomSettings();
    const payload = { ...store.opts, paletteIdx: store.paletteIdx, templateId: store.templateId };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${location.origin}${location.pathname}#cfg=${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
        showToast(t('toast.shareSuccess'));
    }).catch(() => {
        showToast(t('toast.shareFail'));
    });
}

export function setAppearance(mode) {
    store.appearanceMode = mode;
    document.documentElement.setAttribute('data-appearance', mode);
    saveAppearance(mode);

    dom.appearance.querySelectorAll('.mc__appearance-btn').forEach(btn => {
        btn.classList.toggle('mc__appearance-btn--active', btn.dataset.mode === mode);
    });
}

export function bindEvents() {
    const debouncedRefresh = debounce(refresh, 250);

    dom.markdown.addEventListener('input', debouncedRefresh);
    dom.format.addEventListener('change', refresh);

    dom.exportPng.addEventListener('click', () => exportAll('png'));
    dom.exportJpg.addEventListener('click', () => exportAll('jpg'));

    dom.toggleDrawer.addEventListener('click', openDrawer);
    dom.closeDrawer.addEventListener('click', closeDrawer);
    dom.drawerOvl.addEventListener('click', closeDrawer);

    dom.resetBtn.addEventListener('click', resetAll);
    dom.shareBtn.addEventListener('click', shareConfig);

    dom.appearance.querySelectorAll('.mc__appearance-btn').forEach(btn => {
        btn.addEventListener('click', () => setAppearance(btn.dataset.mode));
    });

    dom.langSwitch.addEventListener('change', () => setLocale(dom.langSwitch.value));

    const sliders = [
        [dom.h1, dom.h1V, 'h1'],
        [dom.h2, dom.h2V, 'h2'],
        [dom.h3, dom.h3V, 'h3'],
        [dom.body, dom.bodyV, 'bodyFs'],
        [dom.lh, dom.lhV, 'lh'],
        [dom.pad, dom.padV, 'pad'],
        [dom.my, dom.myV, 'my'],
        [dom.bw, dom.bwV, 'bw'],
        [dom.br, dom.brV, 'br'],
    ];

    for (const [input, display, key] of sliders) {
        input.addEventListener('input', () => {
            const level = +input.value;
            store.opts[key] = levelToValue(key, level);
            const val = store.opts[key];
            display.textContent = (key === 'lh') ? String(val) : val + 'px';
            debouncedRefresh();
        });
    }

    const colors = [
        [dom.bg, 'bg'],
        [dom.headC, 'headC'],
        [dom.bodyC, 'bodyC'],
        [dom.bc, 'bc'],
    ];

    for (const [input, key] of colors) {
        input.addEventListener('input', () => {
            store.opts[key] = input.value;
            debouncedRefresh();
        });
    }

    dom.watermark.addEventListener('input', debouncedRefresh);

    setupImageUpload(dom.markdown, debouncedRefresh);

    window.addEventListener('beforeunload', persist);
}
