/**
 * Card aspect ratio configurations.
 * `w`/`h` = output pixel dimensions, `pw`/`ph` = preview CSS dimensions.
 * @type {Record<string, { w: number, h: number, pw: number, ph: number }>}
 */
export const FORMATS = {
    portrait: { w: 1080, h: 1440, pw: 300, ph: 400 },
    story:    { w: 1080, h: 1920, pw: 270, ph: 480 },
    square:   { w: 1080, h: 1080, pw: 300, ph: 300 },
    wide:     { w: 1920, h: 1080, pw: 360, ph: 203 },
};

/**
 * Discrete level lookup tables for each style property.
 * Index 0-10 maps to actual CSS values.
 * @type {Record<string, number[]>}
 */
export const LEVELS = {
    h1:     [16, 18, 20, 24, 24, 28, 28, 36, 36, 48, 48],
    h2:     [14, 16, 18, 18, 20, 20, 24, 24, 28, 36, 36],
    h3:     [12, 14, 14, 16, 16, 18, 18, 20, 24, 24, 28],
    bodyFs: [11, 12, 12, 14, 14, 16, 16, 18, 20, 24, 28],
    lh:     [1.15, 1.2, 1.25, 1.4, 1.5, 1.6, 1.75, 1.75, 1.75, 1.75, 1.75],
    pad:    [12, 16, 20, 24, 28, 32, 40, 48, 60, 76, 96],
    my:     [4,  4,  4,  8,  12, 16, 20, 28, 40, 48, 60],
    bw:     [0,  1,  2,  3,  4,  5,  7,  9,  12, 14, 16],
    br:     [0,  0,  4,  4,  8,  8,  12, 12, 9999, 9999, 9999],
};

/**
 * Convert a level index (0-10) to its actual CSS value.
 * @param {string} key - Style property key from LEVELS
 * @param {number} level - Level index (0-10)
 * @returns {number} The actual value (px, ratio, etc.)
 */
export function levelToValue(key, level) {
    const table = LEVELS[key];
    if (!table) return level;
    const idx = Math.max(0, Math.min(10, Math.round(level)));
    return table[idx];
}

/**
 * Convert an actual CSS value to the closest level index (0-10).
 * @param {string} key - Style property key from LEVELS
 * @param {number} value - Actual CSS value
 * @returns {number} Closest level index
 */
export function valueToLevel(key, value) {
    const table = LEVELS[key];
    if (!table) return value;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < table.length; i++) {
        const dist = Math.abs(table[i] - value);
        if (dist <= bestDist) { bestDist = dist; best = i; }
    }
    return best;
}

/**
 * Default style settings for new cards.
 * @type {{ h1: number, h2: number, h3: number, bodyFs: number, lh: number, bg: string, headC: string, bodyC: string, pad: number, my: number, bw: number, bc: string, br: number, watermark: string }}
 */
export const DEFAULTS = {
    h1: 20, h2: 18, h3: 16,
    bodyFs: 14, lh: 1.25,
    bg: '#faf7f0', headC: '#1A1A1A', bodyC: '#333333',
    pad: 24, my: 12,
    bw: 0, bc: '#E0E0E0',
    br: 0,
    watermark: 'MDCard',
};