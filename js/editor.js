/**
 * Strip Editor controller:
 * - requestAnimationFrame-batched canvas rendering
 * - Sticker & text overlay drag, scale, rotate (mouse corner handle + touch pinch/rotate)
 * - Freehand pen & eraser drawing
 * - Tap-to-select individual photo slots
 */

import { state, pushHistory, notify } from './state.js';
import { computeStripGeometry, renderStripToCanvas } from './renderer.js';

let canvasEl = null;
let overlayEl = null;
let selectionBarEl = null;
let selectionInfoEl = null;
let selectionActionsEl = null;
let onPhotoSelectedCallback = null;
let onRetakeSingleCallback = null;

let renderQueued = false;
let lastGeom = null;

// Active pointer tracking for drag, handle transform, pinch, or freehand draw
const activePointers = new Map();
let interaction = null;
let activeStroke = null;

export function initEditor(elements, callbacks = {}) {
  canvasEl = elements.canvas;
  overlayEl = elements.overlay;
  selectionBarEl = elements.selectionBar;
  selectionInfoEl = elements.selectionInfo;
  selectionActionsEl = elements.selectionActions;
  onPhotoSelectedCallback = callbacks.onPhotoSelected || null;
  onRetakeSingleCallback = callbacks.onRetakeSingle || null;

  overlayEl.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);
}

export function scheduleRender() {
  if (renderQueued || !canvasEl) return;
  renderQueued = true;
  requestAnimationFrame(async () => {
    renderQueued = false;
    if (!canvasEl || state.captures.length === 0) return;
    lastGeom = await renderStripToCanvas(canvasEl, state, 1);
    syncOverlayUI();
  });
}

export function addStickerOverlay(stickerId) {
  pushHistory();
  const id = `ov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  state.edits.overlays.push({
    id,
    kind: 'sticker',
    stickerId,
    x: 0.5,
    y: 0.48,
    scale: 1,
    rotation: (Math.random() * 14 - 7) | 0,
    width: 74,
    height: 74,
  });
  state.selection = { type: 'overlay', id };
  state.drawTool.active = false;
  notify('overlay');
  scheduleRender();
}

export function addTextOverlay(text, font = 'sans', color = '#161412') {
  const trimmed = (text || '').trim();
  if (!trimmed) return;
  pushHistory();
  const id = `ov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  state.edits.overlays.push({
    id,
    kind: 'text',
    text: trimmed,
    font,
    color,
    fontSize: 22,
    x: 0.5,
    y: 0.5,
    scale: 1,
    rotation: 0,
    width: Math.max(80, trimmed.length * 13),
    height: 32,
  });
  state.selection = { type: 'overlay', id };
  state.drawTool.active = false;
  notify('overlay');
  scheduleRender();
}

function getNormalizedPoint(clientX, clientY) {
  const rect = overlayEl.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    rect,
  };
}

function hitTestOverlay(nx, ny) {
  if (!lastGeom) return null;
  const px = nx * lastGeom.width;
  const py = ny * lastGeom.height;

  for (let i = state.edits.overlays.length - 1; i >= 0; i--) {
    const item = state.edits.overlays[i];
    const cx = item.x * lastGeom.width;
    const cy = item.y * lastGeom.height;
    const halfW = ((item.width || 70) * (item.scale || 1)) / 2 + 8;
    const halfH = ((item.height || 70) * (item.scale || 1)) / 2 + 8;

    const rad = (-(item.rotation || 0) * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ly = dx * Math.sin(rad) + dy * Math.cos(rad);

    if (Math.abs(lx) <= halfW && Math.abs(ly) <= halfH) {
      return item;
    }
  }
  return null;
}

function hitTestPhotoSlot(nx, ny) {
  if (!lastGeom) return null;
  const px = nx * lastGeom.width;
  const py = ny * lastGeom.height;
  return lastGeom.slots.find(
    (s) => px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h
  ) || null;
}

function handlePointerDown(e) {
  if (state.screen !== 'editor') return;
  overlayEl.setPointerCapture?.(e.pointerId);
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  const { x: nx, y: ny } = getNormalizedPoint(e.clientX, e.clientY);

  // 1. Freehand draw mode
  if (state.drawTool.active) {
    pushHistory();
    activeStroke = {
      color: state.drawTool.color,
      size: state.drawTool.size,
      eraser: state.drawTool.eraser,
      points: [{ x: nx, y: ny }],
    };
    state.edits.strokes.push(activeStroke);
    scheduleRender();
    return;
  }

  // 2. Transform handle hit
  if (e.target.dataset && e.target.dataset.handle === 'transform' && state.selection.type === 'overlay') {
    const item = state.edits.overlays.find((o) => o.id === state.selection.id);
    if (item && lastGeom) {
      pushHistory();
      const rect = overlayEl.getBoundingClientRect();
      const cx = rect.left + item.x * rect.width;
      const cy = rect.top + item.y * rect.height;
      const startDist = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
      const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
      interaction = {
        mode: 'handle',
        itemId: item.id,
        cx,
        cy,
        startDist,
        startAngle,
        origScale: item.scale || 1,
        origRotation: item.rotation || 0,
      };
      return;
    }
  }

  // 3. Two-finger pinch/rotate on selected overlay
  if (activePointers.size === 2 && state.selection.type === 'overlay') {
    const item = state.edits.overlays.find((o) => o.id === state.selection.id);
    if (item) {
      const pts = Array.from(activePointers.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      interaction = {
        mode: 'pinch',
        itemId: item.id,
        startDist: dist,
        startAngle: angle,
        origScale: item.scale || 1,
        origRotation: item.rotation || 0,
      };
      return;
    }
  }

  // 4. Hit-test overlays
  const hitOverlay = hitTestOverlay(nx, ny);
  if (hitOverlay) {
    pushHistory();
    state.selection = { type: 'overlay', id: hitOverlay.id };
    interaction = {
      mode: 'drag',
      itemId: hitOverlay.id,
      startX: nx,
      startY: ny,
      origX: hitOverlay.x,
      origY: hitOverlay.y,
    };
    syncOverlayUI();
    notify('selection');
    return;
  }

  // 5. Hit-test photo slot
  const hitSlot = hitTestPhotoSlot(nx, ny);
  if (hitSlot) {
    state.selection = { type: 'photo', id: hitSlot.photoIndex };
    syncOverlayUI();
    notify('selection');
    if (onPhotoSelectedCallback) onPhotoSelectedCallback(hitSlot.photoIndex);
    return;
  }

  // 6. Clear selection & allow physical strip spring-drag
  state.selection = { type: null, id: null };
  syncOverlayUI();
  notify('selection');

  const paperWrap = overlayEl.parentElement;
  if (paperWrap && paperWrap.classList.contains('strip-paper-wrap')) {
    interaction = {
      mode: 'paper-spring',
      paperWrap,
      startX: e.clientX,
      startY: e.clientY,
    };
    paperWrap.classList.add('is-dragging-paper');
  }
}

function handlePointerMove(e) {
  if (activePointers.has(e.pointerId)) {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  if (activeStroke && state.drawTool.active) {
    const { x: nx, y: ny } = getNormalizedPoint(e.clientX, e.clientY);
    activeStroke.points.push({ x: nx, y: ny });
    scheduleRender();
    return;
  }

  if (!interaction) return;
  if (interaction.mode === 'paper-spring') {
    const dx = Math.max(-28, Math.min(28, (e.clientX - interaction.startX) * 0.35));
    const dy = Math.max(-28, Math.min(28, (e.clientY - interaction.startY) * 0.35));
    const rot = -0.55 + dx * 0.08;
    interaction.paperWrap.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
    return;
  }
  const item = state.edits.overlays.find((o) => o.id === interaction.itemId);
  if (!item) return;

  if (interaction.mode === 'drag') {
    const { x: nx, y: ny } = getNormalizedPoint(e.clientX, e.clientY);
    item.x = Math.max(0.04, Math.min(0.96, interaction.origX + (nx - interaction.startX)));
    item.y = Math.max(0.04, Math.min(0.96, interaction.origY + (ny - interaction.startY)));
    scheduleRender();
  } else if (interaction.mode === 'handle') {
    const dist = Math.hypot(e.clientX - interaction.cx, e.clientY - interaction.cy) || 1;
    const angle = Math.atan2(e.clientY - interaction.cy, e.clientX - interaction.cx);
    item.scale = Math.max(0.35, Math.min(3.0, interaction.origScale * (dist / interaction.startDist)));
    item.rotation = interaction.origRotation + ((angle - interaction.startAngle) * 180) / Math.PI;
    scheduleRender();
  } else if (interaction.mode === 'pinch' && activePointers.size >= 2) {
    const pts = Array.from(activePointers.values());
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
    const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
    item.scale = Math.max(0.35, Math.min(3.0, interaction.origScale * (dist / interaction.startDist)));
    item.rotation = interaction.origRotation + ((angle - interaction.startAngle) * 180) / Math.PI;
    scheduleRender();
  }
}

function handlePointerUp(e) {
  activePointers.delete(e.pointerId);
  if (activeStroke) {
    activeStroke = null;
    notify('history');
  }
  if (interaction) {
    if (interaction.mode === 'paper-spring') {
      interaction.paperWrap.classList.remove('is-dragging-paper');
      interaction.paperWrap.style.transform = '';
      interaction = null;
      return;
    }
    interaction = null;
    notify('history');
  }
}

export function syncOverlayUI() {
  if (!overlayEl || !lastGeom) return;
  overlayEl.classList.toggle('is-drawing', state.drawTool.active);
  overlayEl.innerHTML = '';

  const rect = overlayEl.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const scaleX = rect.width / lastGeom.width;
  const scaleY = rect.height / lastGeom.height;

  if (state.selection.type === 'overlay') {
    const item = state.edits.overlays.find((o) => o.id === state.selection.id);
    if (item) {
      const box = document.createElement('div');
      const w = (item.width || 70) * (item.scale || 1) * scaleX;
      const h = (item.height || 70) * (item.scale || 1) * scaleY;
      const cx = item.x * rect.width;
      const cy = item.y * rect.height;

      box.style.cssText = `
        position: absolute;
        left: ${cx - w / 2}px;
        top: ${cy - h / 2}px;
        width: ${w}px;
        height: ${h}px;
        border: 1.5px dashed #B53D2A;
        transform: rotate(${item.rotation || 0}deg);
        pointer-events: none;
        box-sizing: border-box;
      `;

      const handle = document.createElement('button');
      handle.type = 'button';
      handle.dataset.handle = 'transform';
      handle.title = 'Drag to scale & rotate';
      handle.setAttribute('aria-label', 'Scale and rotate handle');
      handle.style.cssText = `
        position: absolute;
        right: -9px;
        bottom: -9px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #B53D2A;
        border: 2px solid #FFFDF9;
        cursor: nwse-resize;
        pointer-events: auto;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      `;
      box.appendChild(handle);
      overlayEl.appendChild(box);
      renderSelectionBar('overlay', item);
      return;
    }
  }

  if (state.selection.type === 'photo') {
    const slots = lastGeom.slots.filter((s) => s.photoIndex === state.selection.id);
    for (const s of slots) {
      const box = document.createElement('div');
      box.style.cssText = `
        position: absolute;
        left: ${s.x * scaleX}px;
        top: ${s.y * scaleY}px;
        width: ${s.w * scaleX}px;
        height: ${s.h * scaleY}px;
        border: 2px solid #B53D2A;
        pointer-events: none;
        box-sizing: border-box;
      `;
      overlayEl.appendChild(box);
    }
    renderSelectionBar('photo', state.selection.id);
    return;
  }

  if (selectionBarEl) selectionBarEl.hidden = true;
}

function renderSelectionBar(type, target) {
  if (!selectionBarEl) return;
  selectionBarEl.hidden = false;
  selectionActionsEl.innerHTML = '';

  if (type === 'overlay') {
    selectionInfoEl.textContent = target.kind === 'text' ? 'TEXT LABEL' : 'STICKER';
    const buttons = [
      { label: 'Forward', action: () => reorderOverlay(target.id, 1) },
      { label: 'Back', action: () => reorderOverlay(target.id, -1) },
      { label: 'Duplicate', action: () => duplicateOverlay(target.id) },
      { label: 'Delete', action: () => deleteOverlay(target.id) },
    ];
    for (const b of buttons) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost btn-sm';
      btn.textContent = b.label;
      btn.addEventListener('click', b.action);
      selectionActionsEl.appendChild(btn);
    }
  } else if (type === 'photo') {
    selectionInfoEl.textContent = `POSE ${target + 1}`;
    const retakeBtn = document.createElement('button');
    retakeBtn.type = 'button';
    retakeBtn.className = 'btn btn-secondary btn-sm';
    retakeBtn.textContent = 'Retake Pose';
    retakeBtn.addEventListener('click', () => {
      if (onRetakeSingleCallback) onRetakeSingleCallback(target);
    });
    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.className = 'btn btn-ghost btn-sm';
    doneBtn.textContent = 'Deselect';
    doneBtn.addEventListener('click', () => {
      state.selection = { type: null, id: null };
      syncOverlayUI();
      notify('selection');
    });
    selectionActionsEl.appendChild(retakeBtn);
    selectionActionsEl.appendChild(doneBtn);
  }
}

function reorderOverlay(id, delta) {
  const list = state.edits.overlays;
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return;
  const nextIdx = Math.max(0, Math.min(list.length - 1, idx + delta));
  if (nextIdx === idx) return;
  pushHistory();
  const [item] = list.splice(idx, 1);
  list.splice(nextIdx, 0, item);
  notify('overlay');
  scheduleRender();
}

function duplicateOverlay(id) {
  const item = state.edits.overlays.find((o) => o.id === id);
  if (!item) return;
  pushHistory();
  const copy = {
    ...JSON.parse(JSON.stringify(item)),
    id: `ov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    x: Math.min(0.92, item.x + 0.05),
    y: Math.min(0.92, item.y + 0.05),
  };
  state.edits.overlays.push(copy);
  state.selection = { type: 'overlay', id: copy.id };
  notify('overlay');
  scheduleRender();
}

function deleteOverlay(id) {
  pushHistory();
  state.edits.overlays = state.edits.overlays.filter((o) => o.id !== id);
  state.selection = { type: null, id: null };
  notify('overlay');
  scheduleRender();
}

export function getLastGeometry() {
  return lastGeom || computeStripGeometry(state.captures.length, state.edits.frame.layout, state.edits.frame.borderWidth, true);
}

