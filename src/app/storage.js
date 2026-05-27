import { DEFAULTS } from './config.js';
import { store, readDomSettings } from './store.js';

export function loadFromHash() {
    const m = location.hash.match(/#cfg=(.+)/);
    if (!m) return false;
    try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
        store.opts = { ...DEFAULTS, ...payload };
        if (payload.paletteIdx != null) store.paletteIdx = payload.paletteIdx;
        if (payload.templateId != null) store.templateId = payload.templateId;
        return true;
    } catch {
        return false;
    }
}

export function persist() {
    readDomSettings();
    localStorage.setItem('mdcard-opts', JSON.stringify(store.opts));
    localStorage.setItem('mdcard-pal', String(store.paletteIdx));
    localStorage.setItem('mdcard-template', store.templateId);
}

export function restore() {
    const saved = localStorage.getItem('mdcard-opts');
    if (saved) {
        try {
            store.opts = { ...DEFAULTS, ...JSON.parse(saved) };
            const pal = localStorage.getItem('mdcard-pal');
            if (pal != null) store.paletteIdx = +pal;
            store.templateId = localStorage.getItem('mdcard-template') || 'default';
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
