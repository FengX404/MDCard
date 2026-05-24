import { FORMATS } from './config.js';
import { applyCardVars, availableHeight } from './settings.js';

const MIN_PAGE_HEIGHT = 10;

export function paginateMarkdown(raw, fmt, s) {
    if (!raw.trim()) return [];

    const sections = raw.split(/^---$/m).map(t => t.trim()).filter(Boolean);
    const pages = [];

    const probe = document.createElement('div');
    probe.className = `mc__card mc__card--${fmt}`;
    probe.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;';
    applyCardVars(probe, s);
    document.body.appendChild(probe);

    const contentBox = document.createElement('div');
    contentBox.className = 'mc__card-body';
    probe.appendChild(contentBox);

    const maxH = availableHeight(fmt, s);

    for (const sec of sections) {
        const html = marked.parse(sec);
        const secPages = splitByRenderedHeight(contentBox, html, maxH);
        pages.push(...secPages);
    }

    document.body.removeChild(probe);
    return pages;
}

function splitByRenderedHeight(container, html, maxH) {
    container.innerHTML = html;

    const lineBreaks = collectLineBreaks(container);

    if (lineBreaks.length === 0) {
        return fallbackSplit(container, html, maxH);
    }

    const containerTop = container.getBoundingClientRect().top;
    const contentEnd = lineBreaks[lineBreaks.length - 1];
    const totalH = contentEnd - containerTop;

    if (totalH <= maxH) return [html];

    const imgBounds = [];
    const imgWraps = container.querySelectorAll('.md-img-wrap');
    for (const img of imgWraps) {
        const rect = img.getBoundingClientRect();
        imgBounds.push({ top: rect.top - containerTop, bottom: rect.bottom - containerTop });
    }

    const results = [];
    let offset = 0;

    while (offset < totalH) {
        const pageEnd = offset + maxH;

        if (pageEnd >= totalH) {
            const h = totalH - offset;
            if (h >= MIN_PAGE_HEIGHT) {
                results.push(buildPage(html, offset, h));
            }
            break;
        }

        let cutY = pageEnd;
        for (let i = lineBreaks.length - 1; i >= 0; i--) {
            const lineOffset = lineBreaks[i] - containerTop;
            if (lineOffset <= pageEnd) {
                cutY = lineOffset;
                break;
            }
        }

        for (const ib of imgBounds) {
            if (ib.top < cutY && ib.bottom > cutY) {
                cutY = ib.top;
                break;
            }
        }

        if (cutY <= offset) {
            cutY = pageEnd;
        }

        const pageH = cutY - offset;
        if (pageH >= MIN_PAGE_HEIGHT) {
            results.push(buildPage(html, offset, pageH));
        }
        offset = cutY;
    }

    return results;
}

function collectLineBreaks(container) {
    const charBounds = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        const parent = node.parentElement;
        if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') continue;

        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
            const range = document.createRange();
            try {
                range.setStart(node, i);
                range.setEnd(node, i + 1);
                const rects = range.getClientRects();
                if (rects.length > 0) {
                    const r = rects[0];
                    charBounds.push({ top: r.top, bottom: r.bottom });
                }
            } catch (_) {}
        }
    }

    const imgWraps = container.querySelectorAll('.md-img-wrap');
    for (const img of imgWraps) {
        const rect = img.getBoundingClientRect();
        charBounds.push({ top: rect.top, bottom: rect.bottom, isImage: true });
    }

    if (charBounds.length === 0) return [];

    charBounds.sort((a, b) => a.top - b.top || a.bottom - b.bottom);

    const lineEnds = [];
    let curLineEnd = charBounds[0].bottom;
    let curIsImage = charBounds[0].isImage || false;

    for (let i = 1; i < charBounds.length; i++) {
        const gap = charBounds[i].top - curLineEnd;
        if (gap > 1) {
            lineEnds.push(curLineEnd);
            curIsImage = false;
        }
        if (charBounds[i].isImage) {
            if (i > 0 && !charBounds[i - 1].isImage && gap <= 1) {
                lineEnds.push(charBounds[i].top);
            }
            curIsImage = true;
        }
        curLineEnd = Math.max(curLineEnd, charBounds[i].bottom);
    }
    lineEnds.push(curLineEnd);

    return lineEnds;
}

function fallbackSplit(container, html, maxH) {
    const totalH = container.scrollHeight;
    if (totalH <= maxH) return [html];
    const pages = [];
    let offset = 0;
    while (offset < totalH) {
        const h = Math.min(maxH, totalH - offset);
        if (h >= MIN_PAGE_HEIGHT) {
            pages.push(buildPage(html, offset, h));
        }
        offset += maxH;
    }
    return pages;
}

function buildPage(html, offset, height) {
    return `<div class="mc__card-clip" style="height:${height}px;overflow:hidden;"><div class="mc__card-body" style="transform:translateY(${-offset}px);">${html}</div></div>`;
}
