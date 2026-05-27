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
    h1:     [14, 17, 20, 24, 26, 28, 31, 34, 37, 40, 44],
    h2:     [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 34],
    h3:     [12, 13, 14, 15, 17, 18, 20, 22, 24, 26, 28],
    bodyFs: [11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26],
    lh:     [1.05, 1.1, 1.25, 1.35, 1.45, 1.5, 1.6, 1.75, 1.9, 2.1, 2.4],
    pad:    [12, 17, 22, 26, 28, 30, 38, 48, 60, 76, 96],
    my:     [2,  2,  4,  6,  10, 14, 20, 28, 38, 48, 60],
    bw:     [0,  1,  2,  3,  4,  5,  7,  9,  12, 14, 16],
    br:     [0,  2,  4,  6,  8,  10, 16, 22, 30, 40, 50],
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
        if (dist < bestDist) { bestDist = dist; best = i; }
    }
    return best;
}

/**
 * Default style settings for new cards.
 * @type {{ h1: number, h2: number, h3: number, bodyFs: number, lh: number, bg: string, headC: string, bodyC: string, pad: number, my: number, bw: number, bc: string, br: number, watermark: string }}
 */
export const DEFAULTS = {
    h1: 20, h2: 18, h3: 15,
    bodyFs: 14, lh: 1.25,
    bg: '#faf7f0', headC: '#3b2d1f', bodyC: '#292018',
    pad: 26, my: 10,
    bw: 0, bc: '#ffffff',
    br: 0,
    watermark: 'MDCard',
};