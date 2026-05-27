import { FORMATS } from './config.js';
import domtoimage from 'dom-to-image-more';

/**
 * Render a card DOM element to a data URL image.
 * @param {HTMLElement} cardEl - The card container element
 * @param {string} fmt - Format key from FORMATS (portrait|story|square|wide)
 * @param {'png'|'jpg'} [kind='png'] - Output image format
 * @returns {Promise<string>} Data URL of the rendered image
 */
export async function renderToImage(cardEl, fmt, kind = 'png') {
    const cfg = FORMATS[fmt];
    const scale = cfg.w / cfg.pw;

    const options = {
        width: cfg.w,
        height: cfg.h,
        style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
        },
    };

    const dataUrl = kind === 'png'
        ? await domtoimage.toPng(cardEl, options)
        : await domtoimage.toJpeg(cardEl, { ...options, quality: 0.95 });

    return dataUrl;
}

/**
 * Convert a base64 data URL to a Blob.
 * @param {string} dataUrl - Data URL (e.g. data:image/png;base64,...)
 * @returns {Blob} Binary blob with the correct MIME type
 */
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

/**
 * Trigger a browser download for a given URL.
 * @param {string} url - Object URL or data URL to download
 * @param {string} filename - Suggested filename for the download
 */
export function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();
}
