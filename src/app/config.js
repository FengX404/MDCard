export const FORMATS = {
    portrait: { w: 1080, h: 1440, pw: 300, ph: 400 },
    story:    { w: 1080, h: 1920, pw: 270, ph: 480 },
    square:   { w: 1080, h: 1080, pw: 300, ph: 300 },
    wide:     { w: 1920, h: 1080, pw: 360, ph: 203 },
};

export const RANGES = {
    h1:     { min: 10, max: 30 },
    h2:     { min: 10, max: 30 },
    h3:     { min: 10, max: 30 },
    bodyFs: { min: 10, max: 30 },
    lh:     { min: 1, max: 2.5, step: 0.1 },
    pad:    { min: 20, max: 100 },
    my:     { min: 0, max: 80 },
    bw:     { min: 0, max: 16 },
    br:     { min: 0, max: 50 },
};

export const DEFAULTS = {
    h1: 20, h2: 18, h3: 16,
    bodyFs: 14, lh: 1.4,
    bg: '#1e1b4b', headC: '#e0e7ff', bodyC: '#c7d2fe',
    pad: 40, my: 20,
    bw: 0, bc: '#818cf8',
    br: 0,
    watermark: '',
};
