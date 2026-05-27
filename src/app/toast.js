const TOAST_DURATION = 2500;
let toastTimer = null;

/**
 * Show a brief toast notification at the bottom of the screen.
 * Auto-dismisses after {@link TOAST_DURATION} ms.
 * @param {string} msg - Message text to display
 */
export function showToast(msg) {
    const el = document.getElementById('mc-toast');
    el.textContent = msg;
    el.classList.add('mc__toast--visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.remove('mc__toast--visible');
    }, TOAST_DURATION);
}
