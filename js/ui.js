/**
 * Main UI controller: wires screens, setup controls, capture loop,
 * printing reveal, editor tabs, keyboard shortcuts, and PWA registration.
 */

import {
  state,
  subscribe,
  pushHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  resetEdits,
  clearCaptures,
  createDefaultEdits,
  PAPER_SWATCHES,
  PEN_COLORS,
  DEFAULT_ADJUSTMENTS,
} from './state.js';
import {
  startCamera,
  stopCamera,
  hasActiveCamera,
  captureVideoFrame,
  generateStudioTestFrame,
  playBeep,
  playShutterSound,
  playPrinterSound,
} from './camera.js';
import { FILTERS, getFilterById } from './filters.js';
import { STICKER_CATEGORIES, STICKERS } from './stickers.js';
import {
  initEditor,
  scheduleRender,
  addStickerOverlay,
  addTextOverlay,
} from './editor.js';
import {
  downloadPNG,
  downloadJPG,
  downloadBuildupGIF,
  copyToClipboard,
  shareNativeFile,
  shareWhatsApp,
  shareInstagram,
  exportStripBlob,
} from './share.js';
import { renderStripToCanvas } from './renderer.js';

const $ = (id) => document.getElementById(id);

const els = {
  viewBooth: $('view-booth'),
  viewPrinting: $('view-printing'),
  viewEditor: $('view-editor'),
  headerHistory: $('header-history'),
  btnUndo: $('btn-undo'),
  btnRedo: $('btn-redo'),
  btnResetEdits: $('btn-reset-edits'),
  btnSoundToggle: $('btn-sound-toggle'),

  // Setup & Capture
  setupHeadline: $('setup-headline'),
  setupPanel: $('setup-panel'),
  capturePanel: $('capture-panel'),
  boothSidebar: document.querySelector('.booth-sidebar'),
  mobileSheetBackdrop: $('mobile-sheet-backdrop'),
  mobileSheetBody: $('mobile-sheet-body'),
  btnMobileSettings: $('btn-mobile-settings'),
  btnCloseSheet: $('btn-close-sheet'),
  btnMobileStart: $('btn-mobile-start'),
  btnStartSession: $('btn-start-session'),

  poseCountGroup: $('pose-count-group'),
  hintPoseCount: $('hint-pose-count'),
  layoutGroup: $('layout-group'),
  timerGroup: $('timer-group'),
  preFilterGroup: $('pre-filter-group'),
  btnFacingToggle: $('btn-facing-toggle'),
  btnMirrorToggle: $('btn-mirror-toggle'),

  cameraVideo: $('camera-video'),
  cameraState: $('camera-state'),
  cameraStateEyebrow: $('camera-state-eyebrow'),
  cameraStateTitle: $('camera-state-title'),
  cameraStateDesc: $('camera-state-desc'),
  btnRetryCamera: $('btn-retry-camera'),
  btnDemoFrames: $('btn-demo-frames'),
  cameraCounter: $('camera-counter'),
  cameraFilterBadge: $('camera-filter-badge'),
  countdownOverlay: $('countdown-overlay'),
  countdownNumber: $('countdown-number'),
  shutterFlash: $('shutter-flash'),
  retakeBanner: $('retake-banner'),
  retakePoseNum: $('retake-pose-num'),

  poseProgressBoxes: $('pose-progress-boxes'),
  captureStatusLabel: $('capture-status-label'),
  btnPauseCapture: $('btn-pause-capture'),
  btnRetakeLast: $('btn-retake-last'),
  btnCancelCapture: $('btn-cancel-capture'),

  // Printing
  printedStripChute: $('printed-strip-chute'),
  printingPreviewImg: $('printing-preview-img'),

  // Editor
  stripCanvas: $('strip-canvas'),
  stripOverlay: $('strip-overlay'),
  selectionBar: $('selection-bar'),
  selectionBarInfo: $('selection-bar-info'),
  selectionBarActions: $('selection-bar-actions'),
  editorTabs: $('editor-tabs'),
  editorFilterGrid: $('editor-filter-grid'),
  adjustSliders: $('adjust-sliders'),
  editorLayoutGroup: $('editor-layout-group'),
  paperSwatches: $('paper-swatches'),
  sliderBorder: $('slider-border'),
  valBorder: $('val-border'),
  sliderRadius: $('slider-radius'),
  valRadius: $('val-radius'),
  inputCaption: $('input-caption'),
  captionFontGroup: $('caption-font-group'),
  btnDateStamp: $('btn-date-stamp'),
  btnBrandingLine: $('btn-branding-line'),
  stickerCatTabs: $('sticker-cat-tabs'),
  stickerGrid: $('sticker-grid'),
  btnDrawMode: $('btn-draw-mode'),
  penColors: $('pen-colors'),
  sliderPenSize: $('slider-pen-size'),
  valPenSize: $('val-pen-size'),
  btnEraserMode: $('btn-eraser-mode'),
  btnClearDrawings: $('btn-clear-drawings'),
  inputOverlayText: $('input-overlay-text'),
  btnAddText: $('btn-add-text'),
  textFontGroup: $('text-font-group'),
  inputTextColor: $('input-text-color'),
  perPhotoEmpty: $('per-photo-empty'),
  perPhotoControls: $('per-photo-controls'),
  selectedPhotoLabel: $('selected-photo-label'),
  perPhotoFilters: $('per-photo-filters'),
  sliderPhotoZoom: $('slider-photo-zoom'),
  valPhotoZoom: $('val-photo-zoom'),
  btnPhotoFlip: $('btn-photo-flip'),
  btnRetakeSingle: $('btn-retake-single'),
  btnDeselectPhoto: $('btn-deselect-photo'),

  // Export & Modals
  btnTakeAgain: $('btn-take-again'),
  btnDownloadMenu: $('btn-download-menu'),
  downloadMenu: $('download-menu'),
  btnDlPng: $('btn-dl-png'),
  btnDlJpg: $('btn-dl-jpg'),
  btnDlGif: $('btn-dl-gif'),
  btnCopyClipboard: $('btn-copy-clipboard'),
  btnShareNative: $('btn-share-native'),
  btnShareWhatsapp: $('btn-share-whatsapp'),
  btnShareInstagram: $('btn-share-instagram'),
  btnShareQr: $('btn-share-qr'),

  modalBackdrop: $('modal-backdrop'),
  modalEyebrow: $('modal-eyebrow'),
  modalTitle: $('modal-title'),
  modalBody: $('modal-body'),
  btnModalClose: $('btn-modal-close'),
  toastRegion: $('toast-region'),
};

let captureController = {
  running: false,
  paused: false,
  cancelled: false,
  useDemoMode: false,
  singleRetakeIndex: null,
};

let activeStickerCat = STICKER_CATEGORIES[0].id;
let activeTextFont = 'sans';

/* ---------- Toast & Modal Helpers ---------- */
function showToast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  els.toastRegion.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function openModal(eyebrow, title, bodyHtml) {
  els.modalEyebrow.textContent = eyebrow;
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = bodyHtml;
  els.modalBackdrop.hidden = false;
}

function closeModal() {
  els.modalBackdrop.hidden = true;
}

/* ---------- Screen Switching ---------- */
function setScreen(screen) {
  state.screen = screen;
  els.viewBooth.hidden = screen !== 'booth';
  els.viewPrinting.hidden = screen !== 'printing';
  els.viewEditor.hidden = screen !== 'editor';
  els.headerHistory.hidden = screen !== 'editor';

  if (screen === 'editor') {
    scheduleRender();
    syncEditorControls();
  }
}

/* ---------- Camera Lifecycle ---------- */
async function initCameraStream() {
  captureController.useDemoMode = false;
  els.cameraState.hidden = false;
  els.cameraStateEyebrow.textContent = 'CAMERA ACCESS';
  els.cameraStateTitle.textContent = 'Connecting lens...';
  els.cameraStateDesc.textContent = 'Allow camera permission in your browser to begin.';

  try {
    await startCamera(els.cameraVideo, state.session.facingMode);
    els.cameraState.hidden = true;
    applyLiveVideoPreviewStyle();
  } catch (err) {
    els.cameraState.hidden = false;
    if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
      els.cameraStateEyebrow.textContent = 'PERMISSION DENIED';
      els.cameraStateTitle.textContent = 'Camera access blocked';
      els.cameraStateDesc.textContent =
        'Enable camera access in your browser site settings and retry, or load studio test frames.';
    } else if (err && err.message === 'UNSUPPORTED_CONTEXT') {
      els.cameraStateEyebrow.textContent = 'HTTPS REQUIRED';
      els.cameraStateTitle.textContent = 'Secure context needed';
      els.cameraStateDesc.textContent =
        'Live camera requires HTTPS or localhost. You can still try studio test frames.';
    } else {
      els.cameraStateEyebrow.textContent = 'NO CAMERA FOUND';
      els.cameraStateTitle.textContent = 'Lens unavailable';
      els.cameraStateDesc.textContent =
        'No active webcam was detected. Connect a camera or use studio test frames.';
    }
  }
}

function applyLiveVideoPreviewStyle() {
  const f = getFilterById(state.session.preFilter);
  els.cameraVideo.style.filter = f.cssPreview;
  els.cameraVideo.classList.toggle('is-mirrored', state.session.mirrored && state.session.facingMode === 'user');
  els.cameraFilterBadge.textContent = f.label.toUpperCase();
}

/* ---------- Setup & Headline Sync ---------- */
function syncSetupUI() {
  const { poseCount, layout, timerSeconds, preFilter, facingMode, mirrored } = state.session;
  const stripWord = layout === 'double' ? '2 STRIPS' : layout === 'grid-2x2' ? '2×2 GRID' : layout === 'grid-2x3' ? '2×3 GRID' : '1 STRIP';
  els.setupHeadline.textContent = `${poseCount} ${poseCount === 1 ? 'POSE' : 'POSES'} / ${stripWord}`;
  els.hintPoseCount.textContent = `${poseCount} ${poseCount === 1 ? 'frame' : 'frames'}`;
  els.cameraCounter.textContent = `${state.captures.length} / ${poseCount}`;

  for (const btn of els.poseCountGroup.querySelectorAll('.seg-btn')) {
    const active = Number(btn.dataset.count) === poseCount;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-checked', String(active));
  }
  for (const btn of els.layoutGroup.querySelectorAll('.layout-btn')) {
    const active = btn.dataset.layout === layout;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-checked', String(active));
  }
  for (const btn of els.timerGroup.querySelectorAll('.seg-btn')) {
    const active = Number(btn.dataset.timer) === timerSeconds;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-checked', String(active));
  }
  for (const btn of els.preFilterGroup.querySelectorAll('.chip-btn')) {
    const active = btn.dataset.filter === preFilter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-checked', String(active));
  }

  els.btnFacingToggle.textContent = facingMode === 'user' ? 'Front' : 'Back';
  els.btnFacingToggle.setAttribute('aria-pressed', String(facingMode === 'environment'));
  els.btnMirrorToggle.textContent = `Mirror: ${mirrored ? 'On' : 'Off'}`;
  els.btnMirrorToggle.classList.toggle('is-active', mirrored);
  els.btnMirrorToggle.setAttribute('aria-pressed', String(mirrored));

  applyLiveVideoPreviewStyle();
}

/* ---------- Mobile Bottom Sheet Placement ---------- */
function syncResponsiveSetupPlacement() {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    if (els.setupPanel.parentElement !== els.mobileSheetBody) {
      els.mobileSheetBody.appendChild(els.setupPanel);
    }
  } else {
    els.mobileSheetBackdrop.hidden = true;
    if (els.setupPanel.parentElement !== els.boothSidebar) {
      els.boothSidebar.appendChild(els.setupPanel);
    }
  }
}

/* ---------- Capture Sequence ---------- */
function renderProgressBoxes(currentIndex) {
  els.poseProgressBoxes.innerHTML = '';
  const total = state.session.poseCount;
  for (let i = 0; i < total; i++) {
    const box = document.createElement('div');
    box.className = 'pose-box';
    const cap = state.captures[i];
    if (cap && cap.thumbUrl) {
      box.classList.add('is-done');
      const img = document.createElement('img');
      img.src = cap.thumbUrl;
      img.alt = `Pose ${i + 1}`;
      box.appendChild(img);
    } else {
      if (i === currentIndex) box.classList.add('is-current');
      box.textContent = `${i + 1}`;
    }
    els.poseProgressBoxes.appendChild(box);
  }
  els.cameraCounter.textContent = `${state.captures.length} / ${total}`;
  els.btnRetakeLast.disabled = state.captures.length === 0 || captureController.singleRetakeIndex !== null;
}

function triggerFlash() {
  els.shutterFlash.classList.remove('is-flashing');
  void els.shutterFlash.offsetWidth;
  els.shutterFlash.classList.add('is-flashing');
}

function showCountdownTick(num) {
  els.countdownNumber.textContent = String(num);
  els.countdownNumber.classList.remove('is-visible');
  void els.countdownNumber.offsetWidth;
  els.countdownNumber.classList.add('is-visible');
  if (state.session.soundEnabled) playBeep(num === 1 ? 880 : 620, 0.07, 0.05);
}

async function waitSecondWithPause() {
  let elapsed = 0;
  while (elapsed < 1000) {
    if (captureController.cancelled) return false;
    if (!captureController.paused) {
      elapsed += 100;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return true;
}

async function runCountdownAndSnap(poseIndex, total) {
  els.captureStatusLabel.textContent = `Pose ${poseIndex + 1} of ${total}`;
  renderProgressBoxes(poseIndex);

  for (let t = state.session.timerSeconds; t >= 1; t--) {
    if (captureController.cancelled) return null;
    while (captureController.paused) {
      if (captureController.cancelled) return null;
      await new Promise((r) => setTimeout(r, 100));
    }
    showCountdownTick(t);
    const ok = await waitSecondWithPause();
    if (!ok) return null;
  }

  els.countdownNumber.textContent = '';
  triggerFlash();
  if (state.session.soundEnabled) playShutterSound();

  const shouldMirror = state.session.mirrored && state.session.facingMode === 'user';
  if (captureController.useDemoMode || !hasActiveCamera()) {
    return generateStudioTestFrame(poseIndex, total);
  }
  return captureVideoFrame(els.cameraVideo, shouldMirror);
}

async function startCaptureSession(singleRetakeIndex = null) {
  els.mobileSheetBackdrop.hidden = true;
  captureController = {
    running: true,
    paused: false,
    cancelled: false,
    useDemoMode: !hasActiveCamera(),
    singleRetakeIndex,
  };

  els.setupPanel.hidden = true;
  els.capturePanel.hidden = false;
  els.btnMobileStart.disabled = true;
  els.btnPauseCapture.textContent = 'Pause';

  if (singleRetakeIndex !== null) {
    els.retakeBanner.hidden = false;
    els.retakePoseNum.textContent = String(singleRetakeIndex + 1);
    const shot = await runCountdownAndSnap(singleRetakeIndex, state.session.poseCount);
    els.retakeBanner.hidden = true;
    if (shot && !captureController.cancelled) {
      const old = state.captures[singleRetakeIndex];
      if (old?.bitmap?.close) old.bitmap.close();
      state.captures[singleRetakeIndex] = { id: `cap_${Date.now()}`, ...shot };
      finishCaptureToEditor();
    }
    return;
  }

  clearCaptures();
  state.edits = createDefaultEdits(state.session.layout, state.session.preFilter);
  state.history.past = [];
  state.history.future = [];
  state.selection = { type: null, id: null };

  const total = state.session.poseCount;
  while (state.captures.length < total) {
    if (captureController.cancelled) break;
    const idx = state.captures.length;
    const shot = await runCountdownAndSnap(idx, total);
    if (!shot || captureController.cancelled) break;
    state.captures.push({ id: `cap_${Date.now()}_${idx}`, ...shot });
    renderProgressBoxes(state.captures.length);
    if (state.captures.length < total) {
      await new Promise((r) => setTimeout(r, 420));
    }
  }

  captureController.running = false;
  els.btnMobileStart.disabled = false;

  if (captureController.cancelled) {
    els.setupPanel.hidden = false;
    els.capturePanel.hidden = true;
    clearCaptures();
    syncSetupUI();
    return;
  }

  await runPrintingSequence();
}

async function runPrintingSequence() {
  stopCamera();
  setScreen('printing');

  const tempCanvas = document.createElement('canvas');
  await renderStripToCanvas(tempCanvas, state, 1);
  els.printingPreviewImg.src = tempCanvas.toDataURL('image/png');
  els.printedStripChute.classList.remove('is-printing');

  if (state.session.soundEnabled) playPrinterSound();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.printedStripChute.classList.add('is-printing');
    });
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  await new Promise((r) => setTimeout(r, reduced ? 200 : 2300));
  finishCaptureToEditor();
}

function finishCaptureToEditor() {
  els.setupPanel.hidden = false;
  els.capturePanel.hidden = true;
  els.btnMobileStart.disabled = false;
  stopCamera();
  setScreen('editor');
}

/* ---------- Editor Controls Construction & Sync ---------- */
function buildEditorControls() {
  // 1. Filters grid
  els.editorFilterGrid.innerHTML = '';
  for (const f of FILTERS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-card';
    btn.dataset.filter = f.id;
    btn.innerHTML = `<span>${f.label}</span><span class="filter-swatch" style="background:${f.swatch}"></span>`;
    btn.addEventListener('click', () => {
      pushHistory();
      state.edits.filter = f.id;
      syncEditorControls();
      scheduleRender();
    });
    els.editorFilterGrid.appendChild(btn);
  }

  // 2. Adjustment sliders
  const sliderSpecs = [
    { key: 'brightness', label: 'Brightness', min: -50, max: 50 },
    { key: 'contrast', label: 'Contrast', min: -50, max: 50 },
    { key: 'saturation', label: 'Saturation', min: -80, max: 80 },
    { key: 'warmth', label: 'Warmth', min: -50, max: 50 },
    { key: 'grain', label: 'Film Grain', min: 0, max: 80 },
    { key: 'vignette', label: 'Vignette', min: 0, max: 80 },
    { key: 'blur', label: 'Softness', min: 0, max: 20 },
    { key: 'sharpness', label: 'Sharpness', min: 0, max: 80 },
  ];

  els.adjustSliders.innerHTML = '';
  for (const spec of sliderSpecs) {
    const wrap = document.createElement('div');
    wrap.className = 'slider-item';
    wrap.innerHTML = `
      <div class="slider-header">
        <label for="adj-${spec.key}">${spec.label}</label>
        <span class="mono-meta" id="val-adj-${spec.key}">${state.edits.adjustments[spec.key]}</span>
      </div>
      <input type="range" id="adj-${spec.key}" min="${spec.min}" max="${spec.max}" value="${state.edits.adjustments[spec.key]}" />
    `;
    const input = wrap.querySelector('input');
    input.addEventListener('pointerdown', () => pushHistory(), { once: false });
    input.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.edits.adjustments[spec.key] = val;
      wrap.querySelector(`#val-adj-${spec.key}`).textContent = String(val);
      scheduleRender();
    });
    els.adjustSliders.appendChild(wrap);
  }

  // 3. Paper swatches + custom color
  els.paperSwatches.innerHTML = '';
  for (const sw of PAPER_SWATCHES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch-btn';
    btn.style.backgroundColor = sw.color;
    btn.title = sw.label;
    btn.setAttribute('aria-label', sw.label);
    btn.dataset.color = sw.color;
    btn.addEventListener('click', () => {
      pushHistory();
      state.edits.frame.bgColor = sw.color;
      syncEditorControls();
      scheduleRender();
    });
    els.paperSwatches.appendChild(btn);
  }
  const customColor = document.createElement('input');
  customColor.type = 'color';
  customColor.className = 'color-well';
  customColor.setAttribute('aria-label', 'Custom paper color');
  customColor.value = state.edits.frame.bgColor;
  customColor.addEventListener('input', (e) => {
    state.edits.frame.bgColor = e.target.value;
    syncEditorControls();
    scheduleRender();
  });
  els.paperSwatches.appendChild(customColor);

  // 4. Sticker categories & grid
  els.stickerCatTabs.innerHTML = '';
  for (const cat of STICKER_CATEGORIES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip-btn';
    btn.textContent = cat.label;
    btn.dataset.cat = cat.id;
    btn.addEventListener('click', () => {
      activeStickerCat = cat.id;
      renderStickerCategory();
    });
    els.stickerCatTabs.appendChild(btn);
  }
  renderStickerCategory();

  // 5. Pen colors
  els.penColors.innerHTML = '';
  for (const col of PEN_COLORS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch-btn';
    btn.style.backgroundColor = col;
    btn.dataset.penColor = col;
    btn.setAttribute('aria-label', `Pen color ${col}`);
    btn.addEventListener('click', () => {
      state.drawTool.color = col;
      state.drawTool.eraser = false;
      syncEditorControls();
    });
    els.penColors.appendChild(btn);
  }

  // 6. Per-photo filters
  els.perPhotoFilters.innerHTML = '';
  const inheritBtn = document.createElement('button');
  inheritBtn.type = 'button';
  inheritBtn.className = 'chip-btn';
  inheritBtn.dataset.photoFilter = '';
  inheritBtn.textContent = 'Strip Default';
  inheritBtn.addEventListener('click', () => setPerPhotoFilter(null));
  els.perPhotoFilters.appendChild(inheritBtn);

  for (const f of FILTERS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip-btn';
    btn.dataset.photoFilter = f.id;
    btn.textContent = f.label;
    btn.addEventListener('click', () => setPerPhotoFilter(f.id));
    els.perPhotoFilters.appendChild(btn);
  }
}

function renderStickerCategory() {
  for (const btn of els.stickerCatTabs.querySelectorAll('.chip-btn')) {
    btn.classList.toggle('is-active', btn.dataset.cat === activeStickerCat);
  }
  els.stickerGrid.innerHTML = '';
  const items = STICKERS.filter((s) => s.category === activeStickerCat);
  for (const st of items) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sticker-pick-btn';
    btn.title = st.label;
    btn.setAttribute('aria-label', `Add ${st.label} sticker`);
    btn.innerHTML = st.svg;
    btn.addEventListener('click', () => addStickerOverlay(st.id));
    els.stickerGrid.appendChild(btn);
  }
}

function setPerPhotoFilter(filterId) {
  if (state.selection.type !== 'photo') return;
  const idx = state.selection.id;
  pushHistory();
  if (!state.edits.perPhoto[idx]) state.edits.perPhoto[idx] = { filter: null, zoom: 1, flipX: false };
  state.edits.perPhoto[idx].filter = filterId;
  syncEditorControls();
  scheduleRender();
}

function syncEditorControls() {
  const { edits, drawTool, selection } = state;

  // Undo/Redo
  els.btnUndo.disabled = !canUndo();
  els.btnRedo.disabled = !canRedo();

  // Filter cards
  for (const btn of els.editorFilterGrid.querySelectorAll('.filter-card')) {
    btn.classList.toggle('is-active', btn.dataset.filter === edits.filter);
  }

  // Adjustment sliders
  for (const key of Object.keys(DEFAULT_ADJUSTMENTS)) {
    const input = $(`adj-${key}`);
    const valEl = $(`val-adj-${key}`);
    if (input && valEl) {
      input.value = edits.adjustments[key];
      valEl.textContent = String(edits.adjustments[key]);
    }
  }

  // Frame
  for (const btn of els.editorLayoutGroup.querySelectorAll('.layout-btn')) {
    btn.classList.toggle('is-active', btn.dataset.layout === edits.frame.layout);
  }
  for (const btn of els.paperSwatches.querySelectorAll('.swatch-btn')) {
    btn.classList.toggle('is-active', btn.dataset.color.toLowerCase() === edits.frame.bgColor.toLowerCase());
  }
  els.sliderBorder.value = edits.frame.borderWidth;
  els.valBorder.textContent = `${edits.frame.borderWidth}px`;
  els.sliderRadius.value = edits.frame.cornerRadius;
  els.valRadius.textContent = `${edits.frame.cornerRadius}px`;
  els.inputCaption.value = edits.frame.caption;

  for (const btn of els.captionFontGroup.querySelectorAll('.seg-btn')) {
    btn.classList.toggle('is-active', btn.dataset.font === edits.frame.captionFont);
  }
  els.btnDateStamp.classList.toggle('is-active', edits.frame.showDate);
  els.btnDateStamp.textContent = `Date Stamp: ${edits.frame.showDate ? 'On' : 'Off'}`;
  els.btnBrandingLine.classList.toggle('is-active', edits.frame.showBranding);
  els.btnBrandingLine.textContent = `Studio Mark: ${edits.frame.showBranding ? 'On' : 'Off'}`;

  // Draw tools
  els.btnDrawMode.classList.toggle('is-active', drawTool.active);
  els.btnDrawMode.textContent = `Pen: ${drawTool.active ? 'On' : 'Off'}`;
  els.btnDrawMode.setAttribute('aria-pressed', String(drawTool.active));
  els.btnEraserMode.classList.toggle('is-active', drawTool.eraser);
  els.btnEraserMode.textContent = `Eraser: ${drawTool.eraser ? 'On' : 'Off'}`;
  for (const btn of els.penColors.querySelectorAll('.swatch-btn')) {
    btn.classList.toggle('is-active', btn.dataset.penColor === drawTool.color);
  }

  // Per-photo panel
  const hasPhoto = selection.type === 'photo';
  els.perPhotoEmpty.hidden = hasPhoto;
  els.perPhotoControls.hidden = !hasPhoto;
  if (hasPhoto) {
    const idx = selection.id;
    const p = edits.perPhoto[idx] || { filter: null, zoom: 1, flipX: false };
    els.selectedPhotoLabel.textContent = `POSE ${idx + 1} SELECTED`;
    els.sliderPhotoZoom.value = Math.round((p.zoom || 1) * 100);
    els.valPhotoZoom.textContent = `${(p.zoom || 1).toFixed(2)}×`;
    els.btnPhotoFlip.classList.toggle('is-active', Boolean(p.flipX));
    for (const btn of els.perPhotoFilters.querySelectorAll('.chip-btn')) {
      const fVal = btn.dataset.photoFilter || null;
      btn.classList.toggle('is-active', fVal === (p.filter || null));
    }
  }
}

function switchEditorTab(tabId) {
  for (const btn of els.editorTabs.querySelectorAll('.tab-btn')) {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  }
  for (const panel of document.querySelectorAll('.tab-panel')) {
    const active = panel.id === `panel-${tabId}`;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  }
}

/* ---------- Event Listeners ---------- */
function bindEvents() {
  window.addEventListener('resize', () => {
    syncResponsiveSetupPlacement();
    if (state.screen === 'editor') scheduleRender();
  });

  // Sound toggle
  els.btnSoundToggle.addEventListener('click', () => {
    state.session.soundEnabled = !state.session.soundEnabled;
    els.btnSoundToggle.textContent = `Sound: ${state.session.soundEnabled ? 'On' : 'Off'}`;
    els.btnSoundToggle.setAttribute('aria-pressed', String(!state.session.soundEnabled));
  });

  // Setup controls
  els.poseCountGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    state.session.poseCount = Number(btn.dataset.count);
    syncSetupUI();
  });

  els.layoutGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.layout-btn');
    if (!btn) return;
    state.session.layout = btn.dataset.layout;
    syncSetupUI();
  });

  els.timerGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    state.session.timerSeconds = Number(btn.dataset.timer);
    syncSetupUI();
  });

  els.preFilterGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip-btn');
    if (!btn) return;
    state.session.preFilter = btn.dataset.filter;
    syncSetupUI();
  });

  els.btnFacingToggle.addEventListener('click', async () => {
    state.session.facingMode = state.session.facingMode === 'user' ? 'environment' : 'user';
    syncSetupUI();
    await initCameraStream();
  });

  els.btnMirrorToggle.addEventListener('click', () => {
    state.session.mirrored = !state.session.mirrored;
    syncSetupUI();
  });

  // Mobile sheet
  els.btnMobileSettings.addEventListener('click', () => {
    els.mobileSheetBackdrop.hidden = false;
    els.btnMobileSettings.setAttribute('aria-expanded', 'true');
  });
  els.btnCloseSheet.addEventListener('click', () => {
    els.mobileSheetBackdrop.hidden = true;
    els.btnMobileSettings.setAttribute('aria-expanded', 'false');
  });
  els.mobileSheetBackdrop.addEventListener('click', (e) => {
    if (e.target === els.mobileSheetBackdrop) {
      els.mobileSheetBackdrop.hidden = true;
    }
  });

  // Camera error state buttons
  els.btnRetryCamera.addEventListener('click', () => initCameraStream());
  els.btnDemoFrames.addEventListener('click', () => {
    captureController.useDemoMode = true;
    els.cameraState.hidden = true;
    showToast('Studio test frames ready. Press Start Session.');
  });

  // Start / Capture controls
  els.btnStartSession.addEventListener('click', () => startCaptureSession(null));
  els.btnMobileStart.addEventListener('click', () => startCaptureSession(null));

  els.btnPauseCapture.addEventListener('click', () => {
    captureController.paused = !captureController.paused;
    els.btnPauseCapture.textContent = captureController.paused ? 'Resume' : 'Pause';
    els.captureStatusLabel.textContent = captureController.paused ? 'Paused' : 'Resuming...';
  });

  els.btnRetakeLast.addEventListener('click', () => {
    if (state.captures.length > 0) {
      const removed = state.captures.pop();
      if (removed?.bitmap?.close) removed.bitmap.close();
      renderProgressBoxes(state.captures.length);
      showToast('Last shot removed. Retaking...');
    }
  });

  els.btnCancelCapture.addEventListener('click', () => {
    captureController.cancelled = true;
  });

  // Editor Tabs
  els.editorTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    switchEditorTab(btn.dataset.tab);
  });

  // Frame controls
  els.editorLayoutGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.layout-btn');
    if (!btn) return;
    pushHistory();
    state.edits.frame.layout = btn.dataset.layout;
    syncEditorControls();
    scheduleRender();
  });

  els.sliderBorder.addEventListener('input', (e) => {
    state.edits.frame.borderWidth = Number(e.target.value);
    syncEditorControls();
    scheduleRender();
  });

  els.sliderRadius.addEventListener('input', (e) => {
    state.edits.frame.cornerRadius = Number(e.target.value);
    syncEditorControls();
    scheduleRender();
  });

  els.inputCaption.addEventListener('input', (e) => {
    state.edits.frame.caption = e.target.value;
    scheduleRender();
  });

  els.captionFontGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    pushHistory();
    state.edits.frame.captionFont = btn.dataset.font;
    syncEditorControls();
    scheduleRender();
  });

  els.btnDateStamp.addEventListener('click', () => {
    pushHistory();
    state.edits.frame.showDate = !state.edits.frame.showDate;
    syncEditorControls();
    scheduleRender();
  });

  els.btnBrandingLine.addEventListener('click', () => {
    pushHistory();
    state.edits.frame.showBranding = !state.edits.frame.showBranding;
    syncEditorControls();
    scheduleRender();
  });

  // Draw & Text
  els.btnDrawMode.addEventListener('click', () => {
    state.drawTool.active = !state.drawTool.active;
    syncEditorControls();
    scheduleRender();
  });

  els.sliderPenSize.addEventListener('input', (e) => {
    state.drawTool.size = Number(e.target.value);
    els.valPenSize.textContent = `${state.drawTool.size}px`;
  });

  els.btnEraserMode.addEventListener('click', () => {
    state.drawTool.eraser = !state.drawTool.eraser;
    state.drawTool.active = true;
    syncEditorControls();
    scheduleRender();
  });

  els.btnClearDrawings.addEventListener('click', () => {
    if (state.edits.strokes.length === 0) return;
    pushHistory();
    state.edits.strokes = [];
    scheduleRender();
    syncEditorControls();
  });

  els.textFontGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    activeTextFont = btn.dataset.font;
    for (const b of els.textFontGroup.querySelectorAll('.seg-btn')) {
      b.classList.toggle('is-active', b === btn);
    }
  });

  els.btnAddText.addEventListener('click', () => {
    addTextOverlay(els.inputOverlayText.value, activeTextFont, els.inputTextColor.value);
    els.inputOverlayText.value = '';
  });

  // Per-photo controls
  els.sliderPhotoZoom.addEventListener('input', (e) => {
    if (state.selection.type !== 'photo') return;
    const idx = state.selection.id;
    if (!state.edits.perPhoto[idx]) state.edits.perPhoto[idx] = { filter: null, zoom: 1, flipX: false };
    state.edits.perPhoto[idx].zoom = Number(e.target.value) / 100;
    syncEditorControls();
    scheduleRender();
  });

  els.btnPhotoFlip.addEventListener('click', () => {
    if (state.selection.type !== 'photo') return;
    const idx = state.selection.id;
    pushHistory();
    if (!state.edits.perPhoto[idx]) state.edits.perPhoto[idx] = { filter: null, zoom: 1, flipX: false };
    state.edits.perPhoto[idx].flipX = !state.edits.perPhoto[idx].flipX;
    syncEditorControls();
    scheduleRender();
  });

  els.btnRetakeSingle.addEventListener('click', async () => {
    if (state.selection.type !== 'photo') return;
    const idx = state.selection.id;
    setScreen('booth');
    await initCameraStream();
    startCaptureSession(idx);
  });

  els.btnDeselectPhoto.addEventListener('click', () => {
    state.selection = { type: null, id: null };
    syncEditorControls();
    scheduleRender();
  });

  // History & Reset
  els.btnUndo.addEventListener('click', () => {
    if (undo()) {
      syncEditorControls();
      scheduleRender();
    }
  });

  els.btnRedo.addEventListener('click', () => {
    if (redo()) {
      syncEditorControls();
      scheduleRender();
    }
  });

  els.btnResetEdits.addEventListener('click', () => {
    resetEdits();
    syncEditorControls();
    scheduleRender();
    showToast('Edits reset to studio default.');
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (state.screen !== 'editor') return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        if (redo()) { syncEditorControls(); scheduleRender(); }
      } else {
        if (undo()) { syncEditorControls(); scheduleRender(); }
      }
    }
  });

  // Export & Share
  els.btnTakeAgain.addEventListener('click', async () => {
    clearCaptures();
    setScreen('booth');
    syncSetupUI();
    await initCameraStream();
  });

  els.btnDownloadMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = els.downloadMenu.hidden;
    els.downloadMenu.hidden = !open;
    els.btnDownloadMenu.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', () => {
    els.downloadMenu.hidden = true;
    els.btnDownloadMenu.setAttribute('aria-expanded', 'false');
  });

  els.btnDlPng.addEventListener('click', async () => {
    showToast('Rendering high-res PNG...');
    await downloadPNG(state);
    showToast('Saved 3× PNG to device.');
  });

  els.btnDlJpg.addEventListener('click', async () => {
    await downloadJPG(state);
    showToast('Saved JPG to device.');
  });

  els.btnDlGif.addEventListener('click', async () => {
    showToast('Encoding buildup GIF...');
    await downloadBuildupGIF(state);
    showToast('Saved animated GIF.');
  });

  els.btnCopyClipboard.addEventListener('click', async () => {
    try {
      await copyToClipboard(state);
      showToast('Copied strip image to clipboard.');
    } catch {
      showToast('Clipboard image copy not supported in this browser.');
    }
  });

  els.btnShareNative.addEventListener('click', async () => {
    try {
      const res = await shareNativeFile(state);
      if (!res.shared) showToast('Saved PNG. Share from your device.');
    } catch (err) {
      if (err && err.name !== 'AbortError') showToast('Could not open share sheet.');
    }
  });

  els.btnShareWhatsapp.addEventListener('click', async () => {
    try {
      const res = await shareWhatsApp(state);
      if (res.method === 'wa-fallback') {
        showToast('Saved image & opened WhatsApp.');
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') showToast('WhatsApp share cancelled.');
    }
  });

  els.btnShareInstagram.addEventListener('click', async () => {
    try {
      const res = await shareInstagram(state);
      if (res.method === 'ig-desktop-saved') {
        openModal(
          'INSTAGRAM',
          'Saved to your device',
          '<p>Saved. Open Instagram and send from your gallery.</p><p class="panel-caption">Desktop browsers cannot send images directly into Instagram DMs or Stories.</p>'
        );
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') showToast('Instagram share cancelled.');
    }
  });

  els.btnShareQr.addEventListener('click', async () => {
    const blob = await exportStripBlob(state, 'jpg');
    const url = URL.createObjectURL(blob);
    openModal(
      'MOBILE TRANSFER',
      'Save & send to phone',
      `<div class="qr-preview-box">
        <img src="${url}" alt="Strip preview" style="max-height:180px;border:1px solid #161412;" />
        <p class="panel-caption" style="margin:0;text-align:center;">
          All processing is local (no server upload). Download the file and AirDrop, Nearby Share, or message it to yourself.
        </p>
      </div>`
    );
  });

  els.btnModalClose.addEventListener('click', closeModal);
  els.modalBackdrop.addEventListener('click', (e) => {
    if (e.target === els.modalBackdrop) closeModal();
  });
}

/* ---------- Bootstrap ---------- */
async function bootstrap() {
  initEditor(
    {
      canvas: els.stripCanvas,
      overlay: els.stripOverlay,
      selectionBar: els.selectionBar,
      selectionInfo: els.selectionBarInfo,
      selectionActions: els.selectionBarActions,
    },
    {
      onPhotoSelected: () => {
        switchEditorTab('photo');
        syncEditorControls();
      },
      onRetakeSingle: async (idx) => {
        setScreen('booth');
        await initCameraStream();
        startCaptureSession(idx);
      },
    }
  );

  subscribe((_state, reason) => {
    if (reason === 'history' || reason === 'reset' || reason === 'overlay' || reason === 'selection') {
      syncEditorControls();
    }
  });

  buildEditorControls();
  syncResponsiveSetupPlacement();
  syncSetupUI();
  bindEvents();
  await initCameraStream();

  // Register offline Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

bootstrap();

