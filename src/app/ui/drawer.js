import PALETTES from '../palettes.js';
import LAYOUTS from '../templates.js';
import { DEFAULTS } from '../config.js';
import { dom } from '../dom.js';
import { store, writeDomSettings } from '../store.js';
import { t } from '../i18n.js';
import { refresh } from './preview.js';

export function renderPalettes() {
    const dark = PALETTES.slice(0, 5);
    const light = PALETTES.slice(5, 10);

    const swatchHTML = (p, i) => `
        <div class="mc__theme-item ${i === store.paletteIdx ? 'mc__theme-item--active' : ''}"
             data-idx="${i}" tabindex="0">
            <div class="mc__theme-swatch" style="background:${p.bg}">
                <div class="mc__theme-bar" style="background:${p.head}"></div>
                <div class="mc__theme-line" style="background:${p.body}"></div>
                <div class="mc__theme-line" style="background:${p.body}"></div>
            </div>
            <div class="mc__theme-name">${t('palettes.' + i)}</div>
        </div>`;

    dom.paletteGrid.innerHTML =
        `<div class="mc__theme-group-label">${t('theme.dark')}</div>` +
        dark.map((p, i) => swatchHTML(p, i)).join('') +
        `<div class="mc__theme-group-label">${t('theme.light')}</div>` +
        light.map((p, i) => swatchHTML(p, i + 5)).join('');

    dom.paletteGrid.querySelectorAll('.mc__theme-item').forEach(el => {
        el.addEventListener('click', () => pickPalette(+el.dataset.idx));
    });
}

export function renderLayouts() {
    const itemHTML = (l) => `
        <div class="mc__template-item ${l.id === store.layoutId ? 'mc__template-item--active' : ''}"
             data-id="${l.id}">
            <div class="mc__template-item-name">${t('templates.' + l.id + '.name')}</div>
        </div>`;

    dom.templateGrid.innerHTML = LAYOUTS.map(itemHTML).join('');

    dom.templateGrid.querySelectorAll('.mc__template-item').forEach(el => {
        el.addEventListener('click', () => pickLayout(el.dataset.id));
    });
}

export function applyPalette(idx) {
    const p = PALETTES[idx];
    store.opts.bg = p.bg;
    store.opts.headC = p.head;
    store.opts.bodyC = p.body;
}

export function pickPalette(idx) {
    applyPalette(idx);
    store.paletteIdx = idx;
    writeDomSettings();
    renderPalettes();
    refresh();
}

export function pickLayout(id) {
    store.layoutId = id;
    const layout = LAYOUTS.find(l => l.id === id);
    // Reset only layout-specific fields — preserve user color customizations
    const layoutFields = ['pad', 'my', 'bw', 'br', 'h1', 'h2', 'h3', 'bodyFs', 'lh'];
    for (const key of layoutFields) {
        store.opts[key] = DEFAULTS[key];
    }
    if (layout && layout.defaults) {
        Object.assign(store.opts, layout.defaults);
    }
    writeDomSettings();
    renderLayouts();
    refresh();
}

export function openDrawer()  { dom.drawer.classList.add('mc__drawer--open'); }
export function closeDrawer() { dom.drawer.classList.remove('mc__drawer--open'); }

export function initCollapsibleGroups() {
    dom.drawer.querySelectorAll('.mc__group-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('mc__group--collapsed');
        });
    });
}
