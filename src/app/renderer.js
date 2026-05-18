import { FORMATS } from './config.js';

export async function renderToImage(cardEl, fmt, kind = 'png') {
    const cfg = FORMATS[fmt];
    const scale = cfg.w / cfg.pw;

    const canvas = await html2canvas(cardEl, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
    });

    return canvas.toDataURL(kind === 'png' ? 'image/png' : 'image/jpeg', 0.95);
}

export function dataUrlToBlob(dataUrl) {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
}

export function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();
}
