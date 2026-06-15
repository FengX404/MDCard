import { applyPalette } from './drawer.js';
import LAYOUTS, { DEFAULT_LAYOUT } from '../templates.js';
import { levelToValue } from '../config.js';
import { createDefaults, availableHeight, applyCardVars } from '../settings.js';
import { renderToImage, triggerDownload, dataUrlToBlob } from '../renderer.js';
import { showToast } from '../toast.js';
import { setupImageUpload } from '../image-upload.js';
import { setLocale, getLocale, t } from '../i18n.js';
import { dom } from '../dom.js';
import { store, readDomSettings, writeDomSettings } from '../store.js';
import { renderPalettes, renderLayouts, openDrawer, closeDrawer } from './drawer.js';
import { refresh } from './preview.js';
import { persist } from '../storage.js';
import { saveDraft, getCurrentId, setCurrentId, clearCurrentId, getAutoSave } from '../draft.js';
import { exportImages } from '../image-upload.js';
import { openDraftsPanel } from './drafts-panel.js';
import JSZip from 'jszip';

function debounce(fn, ms) {
    let id = 0;
    return (...args) => {
        clearTimeout(id);
        id = setTimeout(() => fn(...args), ms);
    };
}

function updateBorderColorState(bw) {
    dom.bc.disabled = bw === 0;
    dom.bc.style.opacity = bw === 0 ? '0.4' : '';
}

export async function exportAll() {
    const cards = dom.cards.querySelectorAll('.mc__card');
    if (!cards.length) return;

    dom.exportPng.disabled = true;
    dom.status.textContent = t('status.generating');

    const fmt = dom.format.value;
    const ts = Date.now();

    try {
        const images = [];
        for (let i = 0; i < cards.length; i++) {
            const url = await renderToImage(cards[i], fmt);
            images.push({ url, name: `mdcard-${i + 1}-${ts}.png` });
            if (i < cards.length - 1) await new Promise(r => setTimeout(r, 100));
        }

        // Try Web Share API on mobile devices
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const blobs = images.map(img => ({
            file: new File([dataUrlToBlob(img.url)], img.name, { type: 'image/png' }),
        }));
        const shareFiles = blobs.map(b => b.file);

        if (isMobile && navigator.canShare && navigator.canShare({ files: shareFiles })) {
            try {
                await navigator.share({ files: shareFiles });
                showToast(t('toast.exportSuccess', { count: images.length, format: 'PNG' }));
            } catch (shareErr) {
                // User cancelled or share failed — fall back to download
                if (shareErr.name !== 'AbortError') {
                    fallbackDownload(images, ts);
                }
            }
        } else {
            fallbackDownload(images, ts);
            showToast(t('toast.exportSuccess', { count: images.length, format: 'PNG' }));
        }
    } catch (e) {
        console.error(e);
        showToast(t('toast.exportFail'));
    }

    dom.exportPng.disabled = false;
    dom.status.textContent = '';
}

function fallbackDownload(images, ts) {
    if (images.length <= 2) {
        for (const img of images) {
            triggerDownload(img.url, img.name);
        }
    } else {
        const zip = new JSZip();
        for (const img of images) {
            zip.file(img.name, dataUrlToBlob(img.url));
        }
        zip.generateAsync({ type: 'blob' }).then(blob => {
            const zipUrl = URL.createObjectURL(blob);
            triggerDownload(zipUrl, `mdcard-${ts}.zip`);
            setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
        });
    }
}

export function resetAll() {
    store.opts = createDefaults();
    store.paletteIdx = 5;
    store.layoutId = DEFAULT_LAYOUT;
    applyPalette(store.paletteIdx);
    writeDomSettings();
    renderPalettes();
    renderLayouts();
    refresh();
    showToast(t('toast.resetDone'));
}

export function shareConfig() {
    readDomSettings();
    const payload = { ...store.opts, paletteIdx: store.paletteIdx, layoutId: store.layoutId };
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const encoded = btoa(binary);
    const url = `${location.origin}${location.pathname}#cfg=${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
        showToast(t('toast.shareSuccess'));
    }).catch(() => {
        showToast(t('toast.shareFail'));
    });
}

export function bindEvents() {
    const debouncedRefresh = debounce(refresh, 250);

    const performAutoSave = async () => {
        const md = dom.markdown.value;
        if (!md.trim()) { clearCurrentId(); return; }
        const currentId = getCurrentId();
        const savedId = await saveDraft(md, exportImages(), currentId);
        if (currentId == null) setCurrentId(savedId);
    };

    const debouncedAutoSave = debounce(() => {
        if (getAutoSave()) performAutoSave();
    }, 2000);

    dom.markdown.addEventListener('input', () => {
        debouncedRefresh();
        debouncedAutoSave();
    });
    const markFormatActive = (fmt) => {
        dom.formatDropdown.querySelectorAll('.mc__format-option').forEach(o => {
            o.classList.toggle('active', o.dataset.format === fmt);
            if (o.dataset.format === fmt) dom.formatLabel.textContent = o.textContent;
        });
    };

    dom.formatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.formatArea.classList.toggle('mc__format--open');
    });

    dom.formatDropdown.addEventListener('click', (e) => {
        const opt = e.target.closest('.mc__format-option');
        if (!opt) return;
        const fmt = opt.dataset.format;
        dom.format.value = fmt;
        dom.format.dispatchEvent(new Event('change', { bubbles: true }));
        markFormatActive(fmt);
        dom.formatArea.classList.remove('mc__format--open');
    });

    document.addEventListener('click', (e) => {
        if (!dom.formatArea.contains(e.target)) {
            dom.formatArea.classList.remove('mc__format--open');
        }
    });

    dom.format.addEventListener('change', () => {
        refresh();
        if (getAutoSave()) performAutoSave();
    });

    dom.exportPng.addEventListener('click', () => exportAll());

    dom.toggleDrawer.addEventListener('click', openDrawer);
    dom.closeDrawer.addEventListener('click', closeDrawer);
    dom.drawerOvl.addEventListener('click', closeDrawer);

    dom.resetBtn.addEventListener('click', resetAll);
    dom.shareBtn.addEventListener('click', shareConfig);

    const opts = dom.langDropdown.querySelectorAll('.mc__lang-option');
    const markActive = (locale) => {
        opts.forEach(o => {
            o.classList.toggle('active', o.dataset.lang === locale);
            if (o.dataset.lang === locale) dom.langLabel.textContent = o.textContent;
        });
    };
    markActive(getLocale());

    dom.langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = dom.langDropdown.parentElement.classList.toggle('mc__lang--open');
        if (!open) return;
        dom.langDropdown.querySelector('.mc__lang-option.active')?.focus();
    });

    dom.langDropdown.addEventListener('click', (e) => {
        const opt = e.target.closest('.mc__lang-option');
        if (!opt) return;
        const locale = opt.dataset.lang;
        setLocale(locale);
        markActive(locale);
        dom.langDropdown.parentElement.classList.remove('mc__lang--open');
    });

    document.addEventListener('click', (e) => {
        if (!dom.langDropdown.parentElement.contains(e.target)) {
            dom.langDropdown.parentElement.classList.remove('mc__lang--open');
        }
    });

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
            if (key === 'bw') updateBorderColorState(val);
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

    updateBorderColorState(store.opts.bw);

    setupImageUpload(dom.markdown, debouncedRefresh, checkImageFits);

    window.addEventListener('beforeunload', () => {
        persist();
        const md = dom.markdown.value;
        if (md.trim()) {
            // Sync save to localStorage as emergency backup (IndexedDB may not complete)
            try {
                localStorage.setItem('mdcard-emergency-draft', md);
                localStorage.setItem('mdcard-emergency-draft-id', String(getCurrentId() || ''));
            } catch { /* localStorage full — ignore */ }
            // Also attempt IndexedDB save (best-effort, may not complete)
            saveDraft(md, exportImages(), getCurrentId()).then(savedId => {
                if (getCurrentId() == null) setCurrentId(savedId);
            });
        }
    });

    dom.draftsBtn.addEventListener('click', openDraftsPanel);

    // ── Mobile overflow menu ──────────────────────────────────────────────
    const overflowArea = document.getElementById('mc-overflow-area');
    const overflowBtn = document.getElementById('mc-overflow-btn');
    const mobileDrafts = document.getElementById('mc-drafts-m');

    if (overflowBtn && overflowArea) {
        overflowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            overflowArea.classList.toggle('mc__overflow--open');
        });
        document.addEventListener('click', (e) => {
            if (!overflowArea.contains(e.target)) {
                overflowArea.classList.remove('mc__overflow--open');
            }
        });
    }

    if (mobileDrafts) {
        mobileDrafts.addEventListener('click', () => {
            overflowArea.classList.remove('mc__overflow--open');
            openDraftsPanel();
        });
    }

    // Mobile language switcher in overflow menu
    const mobileLangOpts = document.getElementById('mc-lang-opts-m');
    const mobileLangLabel = document.getElementById('mc-lang-label-m');
    if (mobileLangOpts) {
        const markMobileLangActive = (locale) => {
            mobileLangOpts.querySelectorAll('.mc__lang-option').forEach(o => {
                o.classList.toggle('active', o.dataset.lang === locale);
                if (o.dataset.lang === locale && mobileLangLabel) {
                    mobileLangLabel.textContent = o.textContent;
                }
            });
        };
        markMobileLangActive(getLocale());

        mobileLangOpts.addEventListener('click', (e) => {
            const opt = e.target.closest('.mc__lang-option');
            if (!opt) return;
            const locale = opt.dataset.lang;
            setLocale(locale);
            markMobileLangActive(locale);
        });
    }
}

function checkImageFits(dataUrl) {
    return new Promise((resolve) => {
        readDomSettings();
        const fmt = dom.format.value;
        const layout = LAYOUTS.find(l => l.id === store.layoutId);
        const familyClass = layout ? 'mc--' + layout.family : '';
        const layoutClass = layout ? layout.cssClass : '';

        const probe = document.createElement('div');
        probe.className = `mc__card mc__card--${fmt} ${familyClass} ${layoutClass}`;
        probe.style.cssText = 'position:absolute;left:-9999px;top:0;';
        applyCardVars(probe, store.opts);
        document.body.appendChild(probe);

        const contentBox = document.createElement('div');
        contentBox.className = 'mc__card-body';
        probe.appendChild(contentBox);

        const wrap = document.createElement('div');
        wrap.className = 'md-img-wrap';
        const img = document.createElement('img');
        img.alt = '';
        wrap.appendChild(img);
        contentBox.appendChild(wrap);

        function measure() {
            const maxH = availableHeight(fmt, store.opts);
            const fits = contentBox.scrollHeight <= maxH;
            document.body.removeChild(probe);
            if (!fits) {
                showImageTooLargeDialog(dataUrl);
            }
            resolve(fits);
        }

        img.onload = measure;
        img.onerror = () => {
            document.body.removeChild(probe);
            resolve(false);
        };
        img.src = dataUrl;
        if (img.complete) measure();
    });
}

function showImageTooLargeDialog(dataUrl) {
    const overlay = document.createElement('div');
    overlay.className = 'mc__alert-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'mc__alert-dialog';

    const icon = document.createElement('div');
    icon.className = 'mc__alert-icon';
    icon.textContent = '!';

    const title = document.createElement('h3');
    title.className = 'mc__alert-title';
    title.textContent = t('toast.imageTooLarge');

    const preview = document.createElement('div');
    preview.className = 'mc__alert-preview';
    const previewImg = document.createElement('img');
    previewImg.src = dataUrl;
    previewImg.alt = '';
    preview.appendChild(previewImg);

    const msg = document.createElement('p');
    msg.className = 'mc__alert-msg';
    msg.textContent = t('toast.imageTooLargeHint');

    const btn = document.createElement('button');
    btn.className = 'mc__btn mc__btn--primary';
    btn.textContent = t('toast.dismiss');
    btn.addEventListener('click', () => overlay.remove());

    dialog.appendChild(icon);
    dialog.appendChild(title);
    dialog.appendChild(preview);
    dialog.appendChild(msg);
    dialog.appendChild(btn);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}
