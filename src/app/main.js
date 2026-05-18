import PALETTES from './palettes.js';
import { FORMATS, DEFAULTS } from './config.js';
import { createDefaults, cloneSettings, applyCardVars } from './settings.js';
import { paginateMarkdown } from './paginator.js';
import { renderToImage, triggerDownload, dataUrlToBlob } from './renderer.js';
import { showToast } from './toast.js';
import JSZip from 'jszip';
import './analytics.js';

marked.setOptions({ breaks: true, gfm: true });

let opts = createDefaults();
let paletteIdx = 0;
let pages = [];
let debounceId = 0;
let appearanceMode = 'dark';

const $ = (id) => document.getElementById(id);

const dom = {
    markdown:     $('mc-markdown'),
    cards:        $('mc-cards'),
    empty:        $('mc-preview-empty'),
    format:       $('mc-format'),
    exportPng:    $('mc-export-png'),
    exportJpg:    $('mc-export-jpg'),
    status:       $('mc-status'),
    drawer:       $('mc-drawer'),
    drawerOvl:    $('mc-drawer-overlay'),
    toggleDrawer: $('mc-toggle-drawer'),
    closeDrawer:  $('mc-close-drawer'),
    paletteGrid:  $('mc-theme-grid'),
    resetBtn:     $('mc-reset'),
    shareBtn:     $('mc-share-config'),
    appearance:   $('mc-appearance'),
    h1: $('mc-h1'),     h1V: $('mc-h1-val'),
    h2: $('mc-h2'),     h2V: $('mc-h2-val'),
    h3: $('mc-h3'),     h3V: $('mc-h3-val'),
    body: $('mc-body'), bodyV: $('mc-body-val'),
    lh: $('mc-lh'),     lhV: $('mc-lh-val'),
    bg: $('mc-bg'),
    headC: $('mc-header-c'),
    bodyC: $('mc-body-c'),
    pad: $('mc-pad'),   padV: $('mc-pad-val'),
    my: $('mc-my'),     myV: $('mc-my-val'),
    bw: $('mc-bw'),     bwV: $('mc-bw-val'),
    bc: $('mc-bc'),
    br: $('mc-br'),     brV: $('mc-br-val'),
    watermark: $('mc-watermark'),
};

function debounce(fn, ms) {
    return (...args) => {
        clearTimeout(debounceId);
        debounceId = setTimeout(() => fn(...args), ms);
    };
}

function readDomSettings() {
    opts.h1 = +dom.h1.value;
    opts.h2 = +dom.h2.value;
    opts.h3 = +dom.h3.value;
    opts.bodyFs = +dom.body.value;
    opts.lh = +dom.lh.value;
    opts.bg = dom.bg.value;
    opts.headC = dom.headC.value;
    opts.bodyC = dom.bodyC.value;
    opts.pad = +dom.pad.value;
    opts.my = +dom.my.value;
    opts.bw = +dom.bw.value;
    opts.bc = dom.bc.value;
    opts.br = +dom.br.value;
    opts.watermark = dom.watermark.value;
}

function writeDomSettings() {
    dom.h1.value = opts.h1;   dom.h1V.textContent = opts.h1;
    dom.h2.value = opts.h2;   dom.h2V.textContent = opts.h2;
    dom.h3.value = opts.h3;   dom.h3V.textContent = opts.h3;
    dom.body.value = opts.bodyFs; dom.bodyV.textContent = opts.bodyFs;
    dom.lh.value = opts.lh;   dom.lhV.textContent = opts.lh;
    dom.bg.value = opts.bg;
    dom.headC.value = opts.headC;
    dom.bodyC.value = opts.bodyC;
    dom.pad.value = opts.pad; dom.padV.textContent = opts.pad;
    dom.my.value = opts.my;   dom.myV.textContent = opts.my;
    dom.bw.value = opts.bw;   dom.bwV.textContent = opts.bw;
    dom.bc.value = opts.bc;
    dom.br.value = opts.br;   dom.brV.textContent = opts.br;
    dom.watermark.value = opts.watermark;
}

function renderPalettes() {
    dom.paletteGrid.innerHTML = PALETTES.map((p, i) => `
        <div class="mc__theme-swatch ${i === paletteIdx ? 'mc__theme-swatch--active' : ''}"
             data-idx="${i}" data-name="${p.name}" style="background:${p.bg}">
            <div class="mc__theme-bar" style="background:${p.head}"></div>
            <div class="mc__theme-line" style="background:${p.body}"></div>
            <div class="mc__theme-line" style="background:${p.body}"></div>
        </div>
    `).join('');

    dom.paletteGrid.querySelectorAll('.mc__theme-swatch').forEach(el => {
        el.addEventListener('click', () => pickPalette(+el.dataset.idx));
    });
}

function pickPalette(idx) {
    const p = PALETTES[idx];
    paletteIdx = idx;
    opts.bg = p.bg;
    opts.headC = p.head;
    opts.bodyC = p.body;
    writeDomSettings();
    renderPalettes();
    refresh();
}

function openDrawer()  { dom.drawer.classList.add('mc__drawer--open'); }
function closeDrawer() { dom.drawer.classList.remove('mc__drawer--open'); }

function refresh() {
    readDomSettings();
    const md = dom.markdown.value;
    const fmt = dom.format.value;
    pages = paginateMarkdown(md, fmt, opts);

    if (pages.length === 0) {
        dom.cards.innerHTML = '';
        dom.empty.style.display = '';
        dom.exportPng.disabled = true;
        dom.exportJpg.disabled = true;
        dom.status.textContent = '';
        return;
    }

    dom.empty.style.display = 'none';
    const total = pages.length;

    dom.cards.innerHTML = pages.map((html, i) => `
        <div class="mc__card-wrapper">
            <span class="mc__card-badge">${i + 1}/${total}</span>
            <div class="mc__card mc__card--${fmt}">
                <div class="mc__card-body">${html}</div>
                ${opts.watermark ? `<div class="mc__card-watermark">${escHtml(opts.watermark)}</div>` : ''}
            </div>
        </div>
    `).join('');

    dom.cards.querySelectorAll('.mc__card').forEach(el => applyCardVars(el, opts));

    dom.exportPng.disabled = false;
    dom.exportJpg.disabled = false;
    dom.status.textContent = `${total} 张卡片`;
}

function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function exportAll(kind) {
    const cards = dom.cards.querySelectorAll('.mc__card');
    if (!cards.length) return;

    dom.exportPng.disabled = true;
    dom.exportJpg.disabled = true;
    dom.status.textContent = '生成中…';

    const fmt = dom.format.value;
    const ts = Date.now();

    try {
        const images = [];
        for (let i = 0; i < cards.length; i++) {
            const url = await renderToImage(cards[i], fmt, kind);
            images.push({ url, name: `mdcard-${i + 1}-${ts}.${kind}` });
            if (i < cards.length - 1) await new Promise(r => setTimeout(r, 100));
        }

        if (images.length <= 2) {
            for (const img of images) {
                triggerDownload(img.url, img.name);
                await new Promise(r => setTimeout(r, 300));
            }
        } else {
            const zip = new JSZip();
            for (const img of images) {
                zip.file(img.name, dataUrlToBlob(img.url));
            }
            const blob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(blob);
            triggerDownload(zipUrl, `mdcard-${ts}.zip`);
            setTimeout(() => URL.revokeObjectURL(zipUrl), 5000);
        }

        showToast(`已导出 ${images.length} 张${kind.toUpperCase()}图片`);
    } catch (e) {
        console.error(e);
        showToast('导出失败，请重试');
    }

    dom.exportPng.disabled = false;
    dom.exportJpg.disabled = false;
    dom.status.textContent = `${cards.length} 张卡片`;
}

function resetAll() {
    opts = createDefaults();
    paletteIdx = 0;
    writeDomSettings();
    renderPalettes();
    refresh();
    showToast('已重置为默认设置');
}

function shareConfig() {
    readDomSettings();
    const payload = { ...opts, paletteIdx };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${location.origin}${location.pathname}#cfg=${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
        showToast('配置链接已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败，请手动复制地址栏');
    });
}

function setAppearance(mode) {
    appearanceMode = mode;
    document.documentElement.setAttribute('data-appearance', mode);
    localStorage.setItem('mdcard-appearance', mode);

    dom.appearance.querySelectorAll('.mc__appearance-btn').forEach(btn => {
        btn.classList.toggle('mc__appearance-btn--active', btn.dataset.mode === mode);
    });
}

function restoreAppearance() {
    const saved = localStorage.getItem('mdcard-appearance');
    const mode = ['dark', 'light', 'system'].includes(saved) ? saved : 'dark';
    setAppearance(mode);
}

function loadFromHash() {
    const m = location.hash.match(/#cfg=(.+)/);
    if (!m) return false;
    try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
        opts = { ...DEFAULTS, ...payload };
        if (payload.paletteIdx != null) paletteIdx = payload.paletteIdx;
        return true;
    } catch (_) {
        return false;
    }
}

function persist() {
    readDomSettings();
    localStorage.setItem('mdcard-opts', JSON.stringify(opts));
    localStorage.setItem('mdcard-pal', String(paletteIdx));
}

function restore() {
    const saved = localStorage.getItem('mdcard-opts');
    if (saved) {
        try {
            opts = { ...DEFAULTS, ...JSON.parse(saved) };
            const pal = localStorage.getItem('mdcard-pal');
            if (pal != null) paletteIdx = +pal;
            return true;
        } catch (_) {}
    }
    return false;
}

function bindEvents() {
    const debouncedRefresh = debounce(refresh, 250);

    dom.markdown.addEventListener('input', debouncedRefresh);
    dom.format.addEventListener('change', refresh);

    dom.exportPng.addEventListener('click', () => exportAll('png'));
    dom.exportJpg.addEventListener('click', () => exportAll('jpg'));

    dom.toggleDrawer.addEventListener('click', openDrawer);
    dom.closeDrawer.addEventListener('click', closeDrawer);
    dom.drawerOvl.addEventListener('click', closeDrawer);

    dom.resetBtn.addEventListener('click', resetAll);
    dom.shareBtn.addEventListener('click', shareConfig);

    dom.appearance.querySelectorAll('.mc__appearance-btn').forEach(btn => {
        btn.addEventListener('click', () => setAppearance(btn.dataset.mode));
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
            opts[key] = +input.value;
            display.textContent = input.value;
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
            opts[key] = input.value;
            debouncedRefresh();
        });
    }

    dom.watermark.addEventListener('input', debouncedRefresh);

    window.addEventListener('beforeunload', persist);
}

function init() {
    const fromHash = loadFromHash();
    const fromLocal = !fromHash && restore();

    restoreAppearance();
    writeDomSettings();
    renderPalettes();

    if (!fromHash && !fromLocal) {
        dom.markdown.value = `# MDCard

将 Markdown 转为精美分享卡片

## 特色功能

- **16 款主题配色** 一键切换
- **毛玻璃界面** 现代设计语言
- **水印 & 配置分享** 原创保护

---

## 快速上手

1. 左侧编写 Markdown
2. 点击 🃏 按钮打开样式面板
3. 选择主题或自定义颜色
4. 导出 PNG / JPG

> 用 --- 强制分页`;
    }

    bindEvents();
    refresh();
}

init();
