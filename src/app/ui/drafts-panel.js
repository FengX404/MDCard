import { listDrafts, loadDraft, deleteDraft, setCurrentId, clearCurrentId, getCurrentId } from '../draft.js';
import { importImages } from '../image-upload.js';
import { dom } from '../dom.js';
import { showToast } from '../toast.js';
import { refresh } from './preview.js';
import { t } from '../i18n.js';

let panelEl = null;
let isOpen = false;

function createPanel() {
    if (panelEl) return panelEl;

    const overlay = document.createElement('div');
    overlay.className = 'mc__drafts-overlay';

    const panel = document.createElement('div');
    panel.className = 'mc__drafts-panel mc__glass';

    const header = document.createElement('div');
    header.className = 'mc__drafts-header';

    const title = document.createElement('h3');
    title.className = 'mc__drafts-title';
    title.setAttribute('data-i18n', 'draft.panelTitle');
    title.textContent = t('draft.panelTitle');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mc__btn mc__btn--icon';
    closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', closeDraftsPanel);

    header.appendChild(title);
    header.appendChild(closeBtn);

    const listContainer = document.createElement('div');
    listContainer.className = 'mc__drafts-list';

    const emptyEl = document.createElement('div');
    emptyEl.className = 'mc__drafts-empty';
    emptyEl.setAttribute('data-i18n', 'draft.empty');
    emptyEl.textContent = t('draft.empty');

    panel.appendChild(header);
    panel.appendChild(listContainer);
    panel.appendChild(emptyEl);
    overlay.appendChild(panel);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDraftsPanel();
    });

    document.body.appendChild(overlay);
    panelEl = { overlay, panel, listContainer, emptyEl };
    return panelEl;
}

function formatTime(ts) {
    const now = Date.now();
    const diff = now - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('draft.justNow');
    if (minutes < 60) return t('draft.minutesAgo', { n: minutes });
    if (hours < 24) return t('draft.hoursAgo', { n: hours });
    return t('draft.daysAgo', { n: days });
}

async function handleLoad(draftId) {
    const draft = await loadDraft(draftId);
    if (!draft) {
        showToast(t('draft.notFound'));
        return;
    }
    importImages(draft.images);
    dom.markdown.value = draft.md;
    setCurrentId(draftId);
    refresh();
    closeDraftsPanel();
    showToast(t('draft.restored', { title: draft.title }));
}

async function handleDelete(draftId, title) {
    if (!confirm(t('draft.confirmDelete', { title }))) return;
    await deleteDraft(draftId);
    const currentId = getCurrentId();
    if (currentId === draftId) {
        clearCurrentId();
    }
    await renderDraftList();
}

async function renderDraftList() {
    const el = panelEl || createPanel();
    const drafts = await listDrafts();
    const currentId = getCurrentId();

    el.listContainer.innerHTML = '';

    if (drafts.length === 0) {
        el.emptyEl.style.display = '';
        return;
    }

    el.emptyEl.style.display = 'none';

    for (const draft of drafts) {
        const item = document.createElement('div');
        item.className = 'mc__draft-item';
        if (draft.id === currentId) {
            item.classList.add('mc__draft-item--active');
        }

        const info = document.createElement('div');
        info.className = 'mc__draft-item__info';

        const titleEl = document.createElement('div');
        titleEl.className = 'mc__draft-item__title';
        titleEl.textContent = draft.title;

        const timeEl = document.createElement('div');
        timeEl.className = 'mc__draft-item__time';
        timeEl.textContent = formatTime(draft.updatedAt);

        info.appendChild(titleEl);
        info.appendChild(timeEl);

        const actions = document.createElement('div');
        actions.className = 'mc__draft-item__actions';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'mc__btn mc__btn--primary mc__btn--sm';
        loadBtn.textContent = t('draft.load');
        loadBtn.addEventListener('click', () => handleLoad(draft.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'mc__btn mc__btn--ghost mc__btn--sm mc__draft-item__delete';
        deleteBtn.textContent = t('draft.delete');
        deleteBtn.addEventListener('click', () => handleDelete(draft.id, draft.title));

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(info);
        item.appendChild(actions);
        el.listContainer.appendChild(item);
    }
}

export function openDraftsPanel() {
    isOpen = true;
    const el = createPanel();
    el.overlay.style.display = 'flex';
    renderDraftList();
}

export function closeDraftsPanel() {
    isOpen = false;
    if (panelEl) {
        panelEl.overlay.style.display = 'none';
    }
}