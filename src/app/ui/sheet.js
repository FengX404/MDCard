/**
 * Mobile bottom-sheet controller — 3-state draggable preview panel.
 *
 * States:
 *   collapsed  — 44 px handle only, editor visible
 *   peek       — 70 dvh, glassmorphism preview
 *   full       — 100 dvh, full-screen preview + back button
 *
 * The handle is the drag target. Tap toggles collapsed ↔ peek.
 * Drag snaps to nearest state based on distance.
 */

import { refresh } from './preview.js';

const sheet = document.getElementById('mc-sheet');
const handle = document.getElementById('mc-sheet-handle');
const backBtn = document.getElementById('mc-sheet-back');

// State management
const STATES = ['collapsed', 'peek', 'full'];
let currentState = 'collapsed';
let hintPlayed = false;

// Heights in px (computed dynamically)
function getHeights() {
    const vh = window.innerHeight;
    return {
        collapsed: 44,
        peek: vh * 0.70,
        full: vh,
    };
}

/** Set the sheet to a specific state. */
function setState(state) {
    const prev = currentState;
    currentState = state;

    // Update CSS classes
    STATES.forEach(s => sheet.classList.remove(`mc__sheet--${s}`));
    sheet.classList.add(`mc__sheet--${state}`);
    sheet.style.height = '';  // let CSS class take over
    sheet.classList.remove('mc__sheet--dragging');

    // Refresh preview content when entering peek or full
    if (state !== 'collapsed' && prev === 'collapsed') {
        refresh();
    }

    // Play handle hint on first peek
    if (state === 'peek' && !hintPlayed && handle) {
        hintPlayed = true;
        handle.classList.add('mc__sheet-handle--hint');
        setTimeout(() => handle.classList.remove('mc__sheet-handle--hint'), 5000);
    }
}

/** Determine the nearest snap state based on current height. */
function nearestState(currentHeight) {
    const h = getHeights();
    const distances = {
        collapsed: Math.abs(currentHeight - h.collapsed),
        peek: Math.abs(currentHeight - h.peek),
        full: Math.abs(currentHeight - h.full),
    };
    let nearest = 'collapsed';
    let minDist = Infinity;
    for (const [state, dist] of Object.entries(distances)) {
        if (dist < minDist) {
            minDist = dist;
            nearest = state;
        }
    }
    return nearest;
}

/** Initialize drag gesture on the handle. */
function initDrag() {
    if (!handle) return;

    let startY = 0;
    let startHeight = 0;
    let dragging = false;
    let moved = false;
    const MOVE_THRESHOLD = 6; // px before we consider it a drag

    handle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startHeight = getHeights()[currentState];
        dragging = true;
        moved = false;
        sheet.classList.add('mc__sheet--dragging');
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const currentY = e.touches[0].clientY;
        const dy = startY - currentY; // positive = dragged up

        if (!moved && Math.abs(dy) < MOVE_THRESHOLD) return;
        moved = true;

        const h = getHeights();
        const newHeight = Math.max(h.collapsed, Math.min(h.full, startHeight + dy));
        sheet.style.height = newHeight + 'px';
    }, { passive: true });

    handle.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;

        if (!moved) {
            // It was a tap — toggle between collapsed and peek
            sheet.classList.remove('mc__sheet--dragging');
            if (currentState === 'collapsed') {
                setState('peek');
            } else if (currentState === 'peek') {
                setState('collapsed');
            } else {
                // full → peek on handle tap
                setState('peek');
            }
            return;
        }

        // Determine current height and snap
        const currentHeight = parseFloat(sheet.style.height) || getHeights()[currentState];
        const target = nearestState(currentHeight);
        setState(target);
    });

    // Mouse fallback for desktop testing
    let mouseDown = false;
    handle.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = getHeights()[currentState];
        mouseDown = true;
        moved = false;
        sheet.classList.add('mc__sheet--dragging');
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        const dy = startY - e.clientY;
        if (!moved && Math.abs(dy) < MOVE_THRESHOLD) return;
        moved = true;
        const h = getHeights();
        const newHeight = Math.max(h.collapsed, Math.min(h.full, startHeight + dy));
        sheet.style.height = newHeight + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (!mouseDown) return;
        mouseDown = false;
        if (!moved) {
            sheet.classList.remove('mc__sheet--dragging');
            if (currentState === 'collapsed') setState('peek');
            else setState('collapsed');
            return;
        }
        const currentHeight = parseFloat(sheet.style.height) || getHeights()[currentState];
        setState(nearestState(currentHeight));
    });
}

/** Initialize the sheet system. */
export function initSheet() {
    if (!sheet) return;

    // Set initial collapsed state
    setState('collapsed');

    // Initialize drag gesture
    initDrag();

    // Back button: full → peek
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            setState('peek');
        });
    }

    // Recalculate on resize
    window.addEventListener('resize', () => {
        if (currentState !== 'collapsed') {
            sheet.style.height = '';  // let CSS class recalculate
        }
    });
}
