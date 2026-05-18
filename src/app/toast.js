const TOAST_DURATION = 2500;
let toastTimer = null;

export function showToast(msg) {
    const el = document.getElementById('mc-toast');
    el.textContent = msg;
    el.classList.add('mc__toast--visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.remove('mc__toast--visible');
    }, TOAST_DURATION);
}
