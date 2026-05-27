import TEMPLATES from '../templates.js';
import { applyCardVars } from '../settings.js';
import { paginateMarkdown } from '../paginator.js';
import { resolveMarkdown } from '../image-upload.js';
import { dom } from '../dom.js';
import { store, readDomSettings } from '../store.js';
import { showToast } from '../toast.js';
import { t } from '../i18n.js';

export function refresh() {
    readDomSettings();
    const md = resolveMarkdown(dom.markdown.value);
    const fmt = dom.format.value;
    const tpl = TEMPLATES.find(tmpl => tmpl.id === store.templateId);
    const tplClass = tpl ? tpl.cssClass : '';

    store.pages = paginateMarkdown(md, fmt, store.opts, () => {
        showToast(t('toast.imageTooLarge'));
    }, tplClass);

    if (store.pages.length === 0) {
        dom.cards.innerHTML = '';
        dom.empty.style.display = '';
        dom.exportPng.disabled = true;
        dom.exportJpg.disabled = true;
        dom.status.textContent = '';
        return;
    }

    dom.empty.style.display = 'none';
    const total = store.pages.length;

    dom.cards.innerHTML = store.pages.map((html, i) => `
        <div class="mc__card-wrapper">
            <span class="mc__card-badge">${i + 1}/${total}</span>
            <div class="mc__card mc__card--${fmt} ${tplClass}">
                <div class="mc__card-body">${html}</div>
                ${store.opts.watermark ? `<div class="mc__card-watermark">${escHtml(store.opts.watermark)}</div>` : ''}
            </div>
        </div>
    `).join('');

    dom.cards.querySelectorAll('.mc__card').forEach(el => applyCardVars(el, store.opts));

    dom.exportPng.disabled = false;
    dom.exportJpg.disabled = false;
    dom.status.textContent = t('status.cards', { count: total });
}

export function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
