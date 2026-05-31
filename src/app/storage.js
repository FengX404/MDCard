import { DEFAULTS } from './config.js';
import { store, readDomSettings } from './store.js';

const OLD_TO_NEW = {
    'default': 'editorial-default',
    'magazine': 'editorial-magazine',
    'minimal': 'swiss-minimal',
    'card': 'swiss-card',
};

function migrateLayoutId(oldId) {
    if (!oldId) return 'editorial-default';
    return OLD_TO_NEW[oldId] || oldId;
}

export function loadFromHash() {
    const m = location.hash.match(/#cfg=(.+)/);
    if (!m) return false;
    try {
        const binary = atob(m[1]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const payload = JSON.parse(new TextDecoder().decode(bytes));
        store.opts = { ...DEFAULTS, ...payload };
        if (payload.paletteIdx != null) store.paletteIdx = payload.paletteIdx;
        if (payload.layoutId != null) store.layoutId = payload.layoutId;
        else if (payload.templateId != null) store.layoutId = migrateLayoutId(payload.templateId);
        return true;
    } catch {
        return false;
    }
}

export function persist() {
    readDomSettings();
    localStorage.setItem('mdcard-opts', JSON.stringify(store.opts));
    localStorage.setItem('mdcard-pal', String(store.paletteIdx));
    localStorage.setItem('mdcard-layout', store.layoutId);
}

export function restore() {
    const saved = localStorage.getItem('mdcard-opts');
    if (saved) {
        try {
            store.opts = { ...DEFAULTS, ...JSON.parse(saved) };
            const pal = localStorage.getItem('mdcard-pal');
            if (pal != null) store.paletteIdx = +pal;
            store.layoutId = migrateLayoutId(
                localStorage.getItem('mdcard-layout') || localStorage.getItem('mdcard-template')
            );
            return true;
        } catch {}
    }
    return false;
}

export function saveAppearance(mode) {
    localStorage.setItem('mdcard-appearance', mode);
}

export function loadAppearance() {
    const saved = localStorage.getItem('mdcard-appearance');
    return ['dark', 'light', 'system'].includes(saved) ? saved : 'system';
}
