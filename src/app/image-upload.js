const imageMap = new Map();
let nextId = 1;

export function exportImages() {
    return Array.from(imageMap.entries());
}

export function importImages(entries) {
    imageMap.clear();
    if (!entries || !entries.length) {
        nextId = 1;
        return;
    }
    let maxId = 0;
    for (const [id, url] of entries) {
        imageMap.set(id, url);
        if (id > maxId) maxId = id;
    }
    nextId = maxId + 1;
}

export function getImageUrl(ref) {
    return imageMap.get(ref) || '';
}

export function resolveMarkdown(md) {
    return md.replace(/!\[([^\]]*)\]\(img:(\d+)\)/g, (match, alt, id) => {
        const url = imageMap.get(+id);
        return url ? `![${alt}](${url})` : match;
    });
}

export function setupImageUpload(textarea, onInsert, validateImage) {
    textarea.addEventListener('paste', (e) => {
        const files = extractImageFiles(e.clipboardData);
        if (files.length > 0) {
            e.preventDefault();
            handleFiles(files, textarea, onInsert, validateImage);
        }
    });

    textarea.addEventListener('drop', (e) => {
        const files = extractImageFiles(e.dataTransfer);
        if (files.length > 0) {
            e.preventDefault();
            handleFiles(files, textarea, onInsert, validateImage);
        }
    });

    textarea.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
        }
    });
}

function extractImageFiles(dataTransfer) {
    if (!dataTransfer || !dataTransfer.files) return [];
    const files = [];
    for (const f of dataTransfer.files) {
        if (f.type.startsWith('image/')) {
            files.push(f);
        }
    }
    return files;
}

async function handleFiles(files, textarea, onInsert, validateImage) {
    for (const file of files) {
        const raw = await readFileAsDataUrl(file);
        if (validateImage) {
            const ok = await validateImage(raw);
            if (!ok) continue;
        }
        const id = nextId++;
        imageMap.set(id, raw);
        insertImageMarkdown(textarea, id, onInsert);
    }
}

function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

function insertImageMarkdown(textarea, id, onInsert) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const md = `![image](img:${id})\n`;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + md + after;
    textarea.selectionStart = textarea.selectionEnd = start + md.length;
    textarea.focus();
    if (onInsert) onInsert();
}
