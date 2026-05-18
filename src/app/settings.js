import { FORMATS, DEFAULTS } from './config.js';

export function createDefaults() {
    return { ...DEFAULTS };
}

export function cloneSettings(s) {
    return { ...s };
}

export function applyCardVars(cardEl, s) {
    const map = {
        '--c-bg': s.bg,
        '--c-head': s.headC,
        '--c-body': s.bodyC,
        '--c-h1': s.h1 + 'px',
        '--c-h2': s.h2 + 'px',
        '--c-h3': s.h3 + 'px',
        '--c-body-fs': s.bodyFs + 'px',
        '--c-lh': String(s.lh),
        '--c-pad': s.pad + 'px',
        '--c-my': s.my + 'px',
        '--c-bw': s.bw + 'px',
        '--c-bc': s.bc,
    };
    for (const [prop, val] of Object.entries(map)) {
        cardEl.style.setProperty(prop, val);
    }
}

export function availableHeight(fmt, s) {
    const cfg = FORMATS[fmt];
    const borderOff = s.bw * 2;
    const padOff = (s.pad * 2) + (s.my * 2);
    return cfg.ph - padOff - borderOff;
}
