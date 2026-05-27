import { applyCardVars, availableHeight } from './settings.js';

const UNSPLITTABLE_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR']);

/**
 * Parse and paginate raw Markdown text into an array of HTML strings.
 * Supports `===` as section separator and `---` as manual page break.
 * Auto-paginates at line boundaries using streaming measurement.
 * @param {string} raw - Raw Markdown input
 * @param {string} fmt - Format key from FORMATS (portrait|story|square|wide)
 * @param {import('./config.js').DEFAULTS} s - Current style settings
 * @returns {string[]} Array of HTML strings, one per page
 */
export function paginateMarkdown(raw, fmt, s) {
    if (!raw.trim()) return [];

    const sections = raw.split(/^===$/m).map(t => t.trim()).filter(Boolean);
    const pages = [];

    const probe = document.createElement('div');
    probe.className = `mc__card mc__card--${fmt}`;
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;';
    applyCardVars(probe, s);
    document.body.appendChild(probe);

    const contentBox = document.createElement('div');
    contentBox.className = 'mc__card-body';
    probe.appendChild(contentBox);

    const maxH = availableHeight(fmt, s);

    for (const sec of sections) {
        const secHtml = marked.parse(sec);
        const secPages = paginateSection(contentBox, secHtml, maxH);
        pages.push(...secPages);
    }

    document.body.removeChild(probe);
    return pages;
}

// ── Streaming pagination ──────────────────────────────────────────────

function paginateSection(container, html, maxH) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const allChildren = Array.from(tempDiv.children);
    if (allChildren.length === 0) return [html];

    // Quick check: everything fits
    container.innerHTML = html;
    if (container.scrollHeight <= maxH) {
        container.innerHTML = '';
        return [html];
    }
    container.innerHTML = '';

    const pages = [];
    let pageContent = []; // array of cloned DOM elements on current page

    for (let i = 0; i < allChildren.length; i++) {
        const child = allChildren[i];

        // Measure: current page content + new child
        const fits = tryAdd(container, pageContent, child, maxH);

        if (fits) {
            pageContent.push(child);
            continue;
        }

        // Child doesn't fit on current page
        const remaining = measureRemaining(container, pageContent, maxH);

        if (pageContent.length > 0 && remaining > 0 && canSplit(child)) {
            // Try to split child to fill the remaining space
            const result = splitElementAtHeight(child, remaining, container);
            if (result) {
                const [firstPart, remainderHTML] = result;
                pages.push(renderHTML(pageContent) + firstPart);
                pageContent = [];

                if (remainderHTML) {
                    // Handle the remainder — it may span multiple pages
                    const remainderPages = splitIntoPages(remainderHTML, container, maxH);
                    if (remainderPages.length > 0) {
                        // All full pages
                        for (let j = 0; j < remainderPages.length - 1; j++) {
                            pages.push(remainderPages[j]);
                        }
                        // Last page may be partial; parse it back to elements
                        const lastDiv = document.createElement('div');
                        lastDiv.innerHTML = remainderPages[remainderPages.length - 1];
                        pageContent = Array.from(lastDiv.children);
                    }
                }
                continue;
            }
        }

        // Can't split or no remaining space — commit current page, start new
        if (pageContent.length > 0) {
            pages.push(renderHTML(pageContent));
            pageContent = [];
        }

        if (canSplit(child)) {
            // Check if child alone exceeds a full page
            const childPages = splitIntoPages(child.outerHTML, container, maxH);
            if (childPages.length > 1) {
                for (let j = 0; j < childPages.length - 1; j++) {
                    pages.push(childPages[j]);
                }
                const lastDiv = document.createElement('div');
                lastDiv.innerHTML = childPages[childPages.length - 1];
                pageContent = Array.from(lastDiv.children);
            } else {
                pageContent = [child];
            }
        } else {
            pageContent = [child];
        }
    }

    if (pageContent.length > 0) {
        pages.push(renderHTML(pageContent));
    }

    container.innerHTML = '';
    return pages;
}

function tryAdd(container, existing, newChild, maxH) {
    container.innerHTML = '';
    for (const c of existing) {
        container.appendChild(c.cloneNode(true));
    }
    container.appendChild(newChild.cloneNode(true));
    return container.scrollHeight <= maxH;
}

function measureRemaining(container, pageContent, maxH) {
    container.innerHTML = '';
    for (const c of pageContent) {
        container.appendChild(c.cloneNode(true));
    }
    const used = container.scrollHeight;
    return Math.max(0, maxH - used);
}

function renderHTML(children) {
    return children.map(c => {
        if (typeof c === 'string') return c;
        return c.outerHTML || c;
    }).join('');
}

// ── Element splitting at a specific height ────────────────────────────

function canSplit(el) {
    const tag = el.tagName || '';
    return !UNSPLITTABLE_TAGS.has(tag) && !isImageWrap(el);
}

function isImageWrap(el) {
    if (el.classList && el.classList.contains) {
        return el.classList.contains('md-img-wrap');
    }
    return false;
}

function splitElementAtHeight(el, targetHeight, container) {
    const tag = (el.tagName || '').toLowerCase();

    if (tag === 'ul' || tag === 'ol') {
        return splitListAtHeight(el, targetHeight, container);
    }
    if (tag === 'table') {
        return splitTableAtHeight(el, targetHeight, container);
    }
    if (tag === 'pre') {
        return splitPreAtHeight(el, targetHeight, container);
    }
    if (tag === 'blockquote') {
        return splitBlockquoteAtHeight(el, targetHeight, container);
    }
    return splitGenericAtHeight(el, targetHeight, container);
}

// ── Generic element (paragraph etc.) splitting via Range API ──────────

function splitGenericAtHeight(el, targetHeight, container) {
    const fullText = el.textContent || '';
    if (fullText.length === 0) return null;

    // Quick check: does the whole element fit?
    container.innerHTML = '';
    const probe = el.cloneNode(true);
    container.appendChild(probe);
    if (container.scrollHeight <= targetHeight) {
        container.innerHTML = '';
        return [el.outerHTML, ''];
    }
    container.innerHTML = '';

    // Binary search for the max character count that fits ≤ targetHeight
    let lo = 0, hi = fullText.length;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        const clone = el.cloneNode(true);
        truncateTextAt(clone, mid);
        container.innerHTML = '';
        container.appendChild(clone);
        if (container.scrollHeight <= targetHeight) {
            lo = mid;
        } else {
            hi = mid - 1;
        }
    }
    container.innerHTML = '';

    if (lo === 0) return null;

    // Build first part
    const firstClone = el.cloneNode(true);
    truncateTextAt(firstClone, lo);
    const firstHTML = firstClone.outerHTML;

    // Build remainder
    const remainderClone = el.cloneNode(true);
    removeTextUpTo(remainderClone, lo);
    remainderClone.normalize();
    const remainderHTML = remainderClone.innerHTML.trim() ? remainderClone.outerHTML : '';

    return [firstHTML, remainderHTML];
}

// Walk text nodes, keep only the first totalChars characters, remove the rest
function truncateTextAt(el, totalChars) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let count = 0;
    while (walker.nextNode()) {
        const node = walker.currentNode;
        const len = node.textContent.length;
        if (count + len >= totalChars) {
            node.textContent = node.textContent.slice(0, totalChars - count);
            // Remove all subsequent siblings going up the tree
            let cursor = node;
            while (cursor !== el) {
                const parent = cursor.parentNode;
                let sib = cursor.nextSibling;
                while (sib) {
                    const next = sib.nextSibling;
                    parent.removeChild(sib);
                    sib = next;
                }
                cursor = parent;
            }
            break;
        }
        count += len;
    }
    el.normalize();
}

// Walk text nodes, remove the first totalChars characters
function removeTextUpTo(el, totalChars) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let count = 0;
    while (walker.nextNode()) {
        const node = walker.currentNode;
        const len = node.textContent.length;
        if (count + len > totalChars) {
            node.textContent = node.textContent.slice(totalChars - count);
            break;
        }
        node.textContent = '';
        count += len;
    }
}

// ── List splitting ────────────────────────────────────────────────────

function splitListAtHeight(el, targetHeight, container) {
    const items = Array.from(el.querySelectorAll(':scope > li'));
    if (items.length === 0) return null;

    container.innerHTML = '';
    const listClone = el.cloneNode(false);

    let firstPartItems = [];
    for (const item of items) {
        const testClone = el.cloneNode(false);
        for (const fi of firstPartItems) {
            testClone.appendChild(fi.cloneNode(true));
        }
        testClone.appendChild(item.cloneNode(true));
        container.innerHTML = '';
        container.appendChild(testClone);
        if (container.scrollHeight > targetHeight) break;
        firstPartItems.push(item);
    }

    if (firstPartItems.length === 0) {
        // Even the first item doesn't fit — split it generically
        const firstItem = items[0];
        const result = splitGenericAtHeight(firstItem, targetHeight, container);
        if (result) {
            const [firstHTML, remainderHTML] = result;
            const firstList = el.cloneNode(false);
            firstList.innerHTML = firstHTML;
            const remainderList = el.cloneNode(false);
            remainderList.innerHTML = remainderHTML;
            for (let j = 1; j < items.length; j++) {
                remainderList.appendChild(items[j].cloneNode(true));
            }
            return [firstList.outerHTML, remainderList.outerHTML];
        }
        return null;
    }

    if (firstPartItems.length === items.length) {
        return [el.outerHTML, '']; // All fits
    }

    const firstList = el.cloneNode(false);
    for (const fi of firstPartItems) {
        firstList.appendChild(fi.cloneNode(true));
    }

    const remainderList = el.cloneNode(false);
    for (let j = firstPartItems.length; j < items.length; j++) {
        remainderList.appendChild(items[j].cloneNode(true));
    }

    // Preserve ordered list numbering on the remainder
    if (el.tagName === 'OL') {
        const origStart = parseInt(el.getAttribute('start')) || 1;
        const remainderStart = origStart + firstPartItems.length;
        remainderList.setAttribute('start', remainderStart);
        // Override CSS counter-reset so the custom counter matches the start value
        remainderList.style.counterReset = 'c-ol ' + (remainderStart - 1);
    }

    return [firstList.outerHTML, remainderList.outerHTML];
}

// ── Table splitting ───────────────────────────────────────────────────

function splitTableAtHeight(el, targetHeight, container) {
    const allRows = Array.from(el.querySelectorAll('tr'));
    if (allRows.length === 0) return null;

    const hasHead = el.querySelector('thead') !== null;
    let headRows = [];
    let bodyRows = allRows;
    if (hasHead) {
        headRows = Array.from(el.querySelector('thead').querySelectorAll('tr'));
        bodyRows = allRows.filter(r => !headRows.includes(r));
    }

    container.innerHTML = '';
    let firstPartRows = [];

    for (const row of bodyRows) {
        const testTable = buildTable(headRows, firstPartRows.concat([row]));
        container.innerHTML = '';
        container.appendChild(testTable);
        if (container.scrollHeight > targetHeight) break;
        firstPartRows.push(row);
    }

    if (firstPartRows.length === 0) return null;
    if (firstPartRows.length === bodyRows.length) return [el.outerHTML, ''];

    const firstTable = buildTable(headRows, firstPartRows);
    const remainderRows = bodyRows.slice(firstPartRows.length);
    const remainderTable = buildTable(headRows, remainderRows);

    return [firstTable.outerHTML, remainderTable.outerHTML];
}

function buildTable(headRows, bodyRows) {
    let html = '<table>';
    if (headRows.length > 0) {
        html += '<thead>' + headRows.map(r => r.outerHTML).join('') + '</thead>';
    }
    html += '<tbody>' + bodyRows.map(r => r.outerHTML).join('') + '</tbody>';
    html += '</table>';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
}

// ── Pre / code splitting ──────────────────────────────────────────────

function splitPreAtHeight(el, targetHeight, container) {
    const codeEl = el.querySelector('code') || el;
    const lines = codeEl.textContent.split('\n');
    if (lines.length <= 1) {
        return splitGenericAtHeight(el, targetHeight, container);
    }

    // Binary search for the maximum lines that fit
    let lo = 1, hi = lines.length;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        const testPre = buildPre(el, codeEl, lines.slice(0, mid));
        container.innerHTML = '';
        container.appendChild(testPre);
        if (container.scrollHeight <= targetHeight) {
            lo = mid;
        } else {
            hi = mid - 1;
        }
    }

    if (lo >= lines.length) return [el.outerHTML, ''];

    const firstPre = buildPre(el, codeEl, lines.slice(0, lo));
    const remainderPre = buildPre(el, codeEl, lines.slice(lo));

    return [firstPre.outerHTML, remainderPre.outerHTML];
}

function buildPre(originalPre, codeEl, lineSlice) {
    const pre = document.createElement('pre');
    if (codeEl !== originalPre) {
        const code = document.createElement('code');
        code.className = codeEl.className || '';
        code.textContent = lineSlice.join('\n');
        pre.appendChild(code);
    } else {
        pre.textContent = lineSlice.join('\n');
    }
    return pre;
}

// ── Blockquote splitting ──────────────────────────────────────────────

function splitBlockquoteAtHeight(el, targetHeight, container) {
    const children = Array.from(el.children);
    if (children.length === 0) {
        return splitGenericAtHeight(el, targetHeight, container);
    }

    container.innerHTML = '';
    let firstPartChildren = [];

    for (const child of children) {
        const testBq = document.createElement('blockquote');
        for (const fc of firstPartChildren) {
            testBq.appendChild(fc.cloneNode(true));
        }
        testBq.appendChild(child.cloneNode(true));
        container.innerHTML = '';
        container.appendChild(testBq);
        if (container.scrollHeight > targetHeight) break;
        firstPartChildren.push(child);
    }

    if (firstPartChildren.length === 0) {
        // First child alone exceeds — split it generically
        const result = splitGenericAtHeight(children[0], targetHeight, container);
        if (result) {
            const [firstHTML, remainderHTML] = result;
            const firstBq = document.createElement('blockquote');
            firstBq.innerHTML = firstHTML;
            const remainderBq = document.createElement('blockquote');
            remainderBq.innerHTML = remainderHTML;
            for (let j = 1; j < children.length; j++) {
                remainderBq.appendChild(children[j].cloneNode(true));
            }
            return [firstBq.outerHTML, remainderBq.outerHTML];
        }
        return null;
    }

    if (firstPartChildren.length === children.length) return [el.outerHTML, ''];

    const firstBq = document.createElement('blockquote');
    for (const fc of firstPartChildren) {
        firstBq.appendChild(fc.cloneNode(true));
    }

    const remainderBq = document.createElement('blockquote');
    for (let j = firstPartChildren.length; j < children.length; j++) {
        remainderBq.appendChild(children[j].cloneNode(true));
    }

    return [firstBq.outerHTML, remainderBq.outerHTML];
}

// ── Split an oversized element into full pages ────────────────────────

function splitIntoPages(html, container, maxH) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const children = Array.from(div.children);
    if (children.length === 0) return [html];

    // Check if it all fits in one page
    container.innerHTML = html;
    if (container.scrollHeight <= maxH) {
        container.innerHTML = '';
        return [html];
    }
    container.innerHTML = '';

    const pages = [];
    let currentContent = [];

    for (const child of children) {
        const fits = tryAdd(container, currentContent, child, maxH);

        if (fits) {
            currentContent.push(child);
            continue;
        }

        if (currentContent.length > 0) {
            pages.push(renderHTML(currentContent));
            currentContent = [];
        }

        if (canSplit(child)) {
            // Check if child alone fits
            container.innerHTML = '';
            container.appendChild(child.cloneNode(true));
            if (container.scrollHeight <= maxH) {
                currentContent = [child];
            } else {
                // Split the oversized child
                const subPages = splitBlockIntoPages(child, container, maxH);
                for (const sp of subPages) {
                    pages.push(sp);
                }
                currentContent = [];
            }
        } else {
            currentContent = [child];
        }
    }

    if (currentContent.length > 0) {
        pages.push(renderHTML(currentContent));
    }

    container.innerHTML = '';
    return pages.length > 0 ? pages : [html];
}

function splitBlockIntoPages(el, container, maxH) {
    // Split a single oversized element into pages ≤ maxH each
    const pages = [];
    let remainingEl = el.cloneNode(true);

    while (true) {
        container.innerHTML = '';
        container.appendChild(remainingEl.cloneNode(true));
        if (container.scrollHeight <= maxH) {
            pages.push(remainingEl.outerHTML);
            break;
        }

        const result = splitElementAtHeight(remainingEl, maxH, container);
        if (!result) {
            pages.push(remainingEl.outerHTML);
            break;
        }

        const [firstPart, remainderHTML] = result;
        pages.push(firstPart);
        if (!remainderHTML) break;

        const div = document.createElement('div');
        div.innerHTML = remainderHTML;
        const remainderChildren = Array.from(div.children);
        if (remainderChildren.length === 0) break;
        remainingEl = remainderChildren[0];
    }

    container.innerHTML = '';
    return pages.length > 0 ? pages : [el.outerHTML];
}

