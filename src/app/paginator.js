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

    if (charBounds.length === 0) return [];

    charBounds.sort((a, b) => a.top - b.top || a.bottom - b.bottom);

    const lineEnds = [];
    let curLineEnd = charBounds[0].bottom;

    for (let i = 1; i < charBounds.length; i++) {
        const gap = charBounds[i].top - curLineEnd;
        if (gap > 1) {
            lineEnds.push(curLineEnd);
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
