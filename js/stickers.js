/**
 * Sticker management:
 * - Die-cut white vinyl outline rendering + bitmap cache
 * - Recently used & Favorites (localStorage)
 * - Custom PNG/SVG sticker uploads (IndexedDB)
 * - FaceDetector API stretch-goal anchor + fallback
 * - "Surprise me" theme-appropriate scatter
 */

import { STICKER_PACKS, ALL_STICKERS, getStickerDef, renderStickerSvg } from './sticker-packs.js';

export { STICKER_PACKS, ALL_STICKERS, getStickerDef, renderStickerSvg };

const RECENT_KEY = 'mistletoe_recent_stickers';
const FAV_KEY = 'mistletoe_fav_stickers';
const IDB_NAME = 'mistletoe_stickers_db';
const IDB_STORE = 'custom_stickers';

const bitmapCache = new Map();
let customStickersCache = [];

/* ---------- Recently Used & Favorites ---------- */
export function getRecentStickerIds() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordRecentSticker(id) {
  const list = getRecentStickerIds().filter((x) => x !== id);
  list.unshift(id);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  } catch {
    // Ignore storage errors
  }
}

export function getFavoriteStickerIds() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavoriteSticker(id) {
  const list = getFavoriteStickerIds();
  const exists = list.includes(id);
  const next = exists ? list.filter((x) => x !== id) : [id, ...list];
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  return !exists;
}

/* ---------- Custom Stickers (IndexedDB) ---------- */
function openStickerDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IDB_UNAVAILABLE'));
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadCustomStickers() {
  try {
    const db = await openStickerDB();
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const items = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    customStickersCache = items;
    return items;
  } catch {
    return [];
  }
}

export function getCustomStickers() {
  return customStickersCache;
}

export async function saveCustomStickerFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const item = {
    id: `custom_${Date.now()}`,
    label: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'Custom',
    dataUrl,
  };

  try {
    const db = await openStickerDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(item);
    await new Promise((res, rej) => {
      tx.oncomplete = res;
      tx.onerror = rej;
    });
  } catch {
    // Keep in memory even if IDB fails
  }

  customStickersCache.unshift(item);
  return item;
}

/* ---------- Die-Cut White Outline Sticker Cache ---------- */
export async function loadStickerImage(id, colorOverride = null, dieCut = true) {
  const key = `${id}__${colorOverride || 'default'}__${dieCut ? 'dc' : 'raw'}`;
  if (bitmapCache.has(key)) return bitmapCache.get(key);

  let rawImg = null;
  const custom = customStickersCache.find((c) => c.id === id);

  if (custom) {
    rawImg = await loadImgFromSrc(custom.dataUrl);
  } else {
    const svgStr = renderStickerSvg(id, colorOverride);
    if (!svgStr) return null;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    rawImg = await loadImgFromSrc(url);
    URL.revokeObjectURL(url);
  }

  if (!rawImg) return null;
  if (!dieCut) {
    bitmapCache.set(key, rawImg);
    return rawImg;
  }

  // Create die-cut white outline vinyl sticker canvas
  const pad = 12;
  const w = 160;
  const h = Math.round((rawImg.naturalHeight / (rawImg.naturalWidth || 100)) * 160) || 160;
  const c = document.createElement('canvas');
  c.width = w + pad * 2;
  c.height = h + pad * 2;
  const ctx = c.getContext('2d');

  // Build solid white silhouette mask on temp canvas
  const sil = document.createElement('canvas');
  sil.width = c.width;
  sil.height = c.height;
  const sctx = sil.getContext('2d');
  sctx.drawImage(rawImg, pad, pad, w, h);
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = '#FFFFFF';
  sctx.fillRect(0, 0, sil.width, sil.height);

  // Stamp 8-direction white outline
  const r = 4.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.drawImage(rawImg, pad, pad, w, h);

  bitmapCache.set(key, c);
  return c;
}

function loadImgFromSrc(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ---------- Face-Aware Prop Placement (Stretch Goal + Fallback) ---------- */
export async function detectFaceAnchor(bitmap) {
  if (!bitmap || typeof window.FaceDetector === 'undefined') {
    return null;
  }
  try {
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    const faces = await detector.detect(bitmap);
    if (faces && faces.length > 0) {
      const b = faces[0].boundingBox;
      return {
        cx: (b.x + b.width / 2) / bitmap.width,
        cy: (b.y + b.height / 2) / bitmap.height,
        wRatio: b.width / bitmap.width,
        hRatio: b.height / bitmap.height,
      };
    }
  } catch {
    // Graceful fallback if FaceDetector throws or is unsupported
  }
  return null;
}

/* ---------- "Surprise Me" Theme-Appropriate Scatter ---------- */
export function generateSurpriseStickers(theme, slots, geomWidth, geomHeight) {
  const pack = STICKER_PACKS.find((p) => p.id === theme.packId) || STICKER_PACKS[0];
  const count = 5 + Math.floor(Math.random() * 4); // 5-8 stickers
  const results = [];

  // Safe edge/corner zones around photo slots to avoid covering faces
  const safeAnchors = [];
  for (const s of slots) {
    safeAnchors.push({ x: (s.x + 14) / geomWidth, y: (s.y + 14) / geomHeight });
    safeAnchors.push({ x: (s.x + s.w - 14) / geomWidth, y: (s.y + s.h - 14) / geomHeight });
  }
  safeAnchors.push({ x: 0.16, y: 0.92 }, { x: 0.84, y: 0.92 });

  for (let i = 0; i < count; i++) {
    const st = pack.stickers[Math.floor(Math.random() * pack.stickers.length)];
    const anchor = safeAnchors[i % safeAnchors.length];
    results.push({
      id: `ov_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`,
      kind: 'sticker',
      stickerId: st.id,
      color: pack.colors[i % pack.colors.length],
      x: Math.max(0.08, Math.min(0.92, anchor.x + (Math.random() - 0.5) * 0.08)),
      y: Math.max(0.06, Math.min(0.94, anchor.y + (Math.random() - 0.5) * 0.06)),
      scale: 0.65 + Math.random() * 0.35,
      rotation: Math.round((Math.random() - 0.5) * 34),
      width: 66,
      height: 66,
    });
  }
  return results;
}
