import { t } from './i18n.js';

const DB_NAME = 'MDCardDraft';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const CURRENT_KEY = 'mdcard-current-draft';
const AUTOSAVE_KEY = 'mdcard-autosave';

let db = null;

function openDB() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };
        request.onerror = () => reject(request.error);
    });
}

export function generateTitle(md) {
    if (!md) return null;
    const headingMatch = md.match(/^#\s+(.+)/m);
    if (headingMatch) return headingMatch[1].trim().slice(0, 60);
    const firstLine = md.trim().split('\n')[0];
    if (firstLine) return firstLine.slice(0, 30) || firstLine;
    return null;
}

export async function saveDraft(md, images, id) {
    const database = await openDB();
    const now = Date.now();
    const title = generateTitle(md) || t('draft.untitled') + ' - ' + new Date(now).toLocaleTimeString();

    const record = {
        title,
        md,
        images: images || [],
        updatedAt: now,
    };

    if (id != null) {
        record.id = id;
        record.createdAt = undefined;
    } else {
        record.createdAt = now;
    }

    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(record);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function loadDraft(id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function listDrafts() {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
            const drafts = request.result || [];
            drafts.sort((a, b) => b.updatedAt - a.updatedAt);
            resolve(drafts);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function deleteDraft(id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export function getCurrentId() {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? +raw : null;
}

export function setCurrentId(id) {
    localStorage.setItem(CURRENT_KEY, String(id));
}

export function clearCurrentId() {
    localStorage.removeItem(CURRENT_KEY);
}

export function getAutoSave() {
    return localStorage.getItem(AUTOSAVE_KEY) !== '0';
}

export function setAutoSave(enabled) {
    localStorage.setItem(AUTOSAVE_KEY, enabled ? '1' : '0');
}
