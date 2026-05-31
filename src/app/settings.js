import { FORMATS, DEFAULTS } from './config.js';

/**
 * Create a fresh copy of the default card settings.
 * @returns {typeof DEFAULTS} A new object with all default values
 */
export function createDefaults() {
    return { ...DEFAULTS };
}

/**
 * Shallow-clone a settings object.
 * @param {typeof DEFAULTS} s - Settings object to clone
 * @returns {typeof DEFAULTS} Shallow copy
 */
export function cloneSettings(s) {
    return { ...s };
}

/**
 * Calculate the relative luminance of a hex color (sRGB).
 * @param {string} hex - Hex color string (e.g. '#ff0000')
 * @returns {number} Luminance value (0-1)
 */
function bgLuminance(hex) {
    const s = hex.replace('#', '');
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Apply card style settings as CSS custom properties on a card element.
 * Sets background, text colors, font sizes, spacing, border, and watermark color.
 * @param {HTMLElement} cardEl - The card container element
 * @param {typeof DEFAULTS} s - Style settings object
 */
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
        '--c-br': s.br + 'px',
        '--mc-watermark-c': bgLuminance(s.bg) > 0.5
            ? 'rgba(0,0,0,0.12)'
            : 'rgba(255,255,255,0.15)',
    };
    for (const [prop, val] of Object.entries(map)) {
        cardEl.style.setProperty(prop, val);
    }
}

/**
 * Calculate the available content height for a card, minus padding and borders.
 * @param {string} fmt - Format key from FORMATS
 * @param {typeof DEFAULTS} s - Style settings object
 * @returns {number} Available height in CSS pixels
 */
const WATERMARK_HEIGHT_ESTIMATE = 20;

export function availableHeight(fmt, s) {
    const cfg = FORMATS[fmt];
    const borderOff = s.bw * 2;
    const padOff = (s.pad * 2) + (s.my * 2);
    const watermarkOff = s.watermark ? WATERMARK_HEIGHT_ESTIMATE : 0;
    return cfg.ph - padOff - borderOff - watermarkOff;
}
