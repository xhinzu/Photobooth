/**
 * Main UI controller: wires screens with View Transitions API,
 * physical machine LED & lens states, sliding pill indicators,
 * capture loop with Polaroid freeze-snapshot, cinematic print sequence,
 * editor tabs with stagger, mobile sheet snap points, and PWA registration.
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
  applyThemeSelection,
  PAPER_SWATCHES,
  PEN_COLORS,
  DEFAULT_ADJUSTMENTS,
} from './state.js';
import { STRIP_THEMES, MIDNIGHT_CAPTIONS, SCENE_FRAMES, getThemeById, applyThemeToAppUI } from './themes.js';
import { renderThemeMiniPreview } from './theme-renderer.js';
import { startFilmFX } from './film-fx.js';
import {
  isSoundEnabled,
  setSoundEnabled,
  isCrackleEnabled,
  setCrackleEnabled,
  ensureAudioContext,
  playCountdownTick,
  playShutterThunk,
} from './audio.js';
import {
  startCamera,
  stopCamera,
  hasActiveCamera,
  captureVideoFrame,
  generateStudioTestFrame,
} from './camera.js';
import { playPrintSequence } from './print-animation.js';
import { FILTERS, getFilterById } from './filters.js';
import {
  STICKER_PACKS,
  ALL_STICKERS,
  renderStickerSvg,
  getRecentStickerIds,
  getFavoriteStickerIds,
  toggleFavoriteSticker,
  loadCustomStickers,
  getCustomStickers,
  saveCustomStickerFile,
} from './stickers.js';
import {
  initEditor,
  scheduleRender,
  addStickerOverlay,
  addTextOverlay,
  scatterSurpriseStickers,
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
  labelSoundToggle: $('label-sound-toggle'),
  btnFilmMode: $('btn-film-mode'),
  btnCrackleToggle: $('btn-crackle-toggle'),
  filmFxCanvas: $('film-fx-canvas'),
  titleCardOverlay: $('title-card-overlay'),
  introLeaderNum: $('intro-leader-num'),
  btnSkipIntro: $('btn-skip-intro'),

  // Setup & Capture
  setupHeadline: $('setup-headline'),
  setupPanel: $('setup-panel'),
  capturePanel: $('capture-panel'),
  boothSidebar: document.querySelector('.booth-sidebar'),
  boothMachine: $('booth-machine'),
  boothLed: $('booth-led'),
  boothLedLabel: $('booth-led-label'),
  mobileSheetBackdrop: $('mobile-sheet-backdrop'),
  mobileSheet: $('mobile-sheet'),
  mobileSheetHandle: $('mobile-sheet-handle'),
  mobileSheetBody: $('mobile-sheet-body'),
  btnMobileSettings: $('btn-mobile-settings'),
  btnCloseSheet: $('btn-close-sheet'),
  btnMobileStart: $('btn-mobile-start'),
  btnStartSession: $('btn-start-session'),

  poseCountGroup: $('pose-count-group'),
  hintPoseCount: $('hint-pose-count'),
  layoutGroup: $('layout-group'),
  timerGroup: $('timer-group'),
  setupThemeGrid: $('setup-theme-grid'),
  btnRandomThemeSetup: $('btn-random-theme-setup'),
  preFilterGroup: $('pre-filter-group'),
  btnFacingToggle: $('btn-facing-toggle'),
  btnMirrorToggle: $('btn-mirror-toggle'),

  cameraVideo: $('camera-video'),
  freezeSnapshot: $('freeze-snapshot'),
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
  printerMachine: $('printer-machine'),
  printerLed: $('printer-led'),
  printerSlotGlow: $('printer-slot-glow'),
  printingStatus: $('printing-status'),
  printingCaption: $('printing-caption'),
  printedStripCard: $('printed-strip-card'),
  printingCanvas: $('printing-canvas'),
  developingVeilLayer: $('developing-veil-layer'),
  lightSweep: $('light-sweep'),
  dustLayer: $('dust-layer'),
  btnSkipPrint: $('btn-skip-print'),

  // Editor
  editorToolsCol: $('editor-tools-col'),
  stripCanvas: $('strip-canvas'),
  stripOverlay: $('strip-overlay'),
  selectionBar: $('selection-bar'),
  selectionBarInfo: $('selection-bar-info'),
  selectionBarActions: $('selection-bar-actions'),
  editorTabs: $('editor-tabs'),
  editorThemeGrid: $('editor-theme-grid'),
  btnRandomThemeEditor: $('btn-random-theme-editor'),
  editorFilterGrid: $('editor-filter-grid'),
  adjustSliders: $('adjust-sliders'),
  editorLayoutGroup: $('editor-layout-group'),
  paperSwatches: $('paper-swatches'),
  sliderBorder: $('slider-border'),
  valBorder: $('val-border'),
  sliderRadius: $('slider-radius'),
  valRadius: $('val-radius'),
  inputCaption: $('input-caption'),
  captionPresets: $('caption-presets'),
  sceneFrameGroup: $('scene-frame-group'),
  btnLightLeak: $('btn-light-leak'),
  btnTitleCardExport: $('btn-title-card-export'),
  captionFontGroup: $('caption-font-group'),
  btnDateStamp: $('btn-date-stamp'),
  btnBrandingLine: $('btn-branding-line'),
  stickerCatTabs: $('sticker-cat-tabs'),
  stickerGrid: $('sticker-grid'),
  inputStickerSearch: $('input-sticker-search'),
  btnSurpriseStickers: $('btn-surprise-stickers'),
  btnUploadSticker: $('btn-upload-sticker'),
  btnMatchFilmLook: $('btn-match-film-look'),
  inputStickerUpload: $('input-sticker-upload'),
  stickerRecentWrap: $('sticker-recent-wrap'),
  stickerRecentRow: $('sticker-recent-row'),
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
  btnReplayPrint: $('btn-replay-print'),
  btnFocusEditor: $('btn-focus-editor'),
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

let activeStickerCat = STICKER_PACKS[0].id;
let stickerSearchQuery = '';
let activeTextFont = 'sans';
let lastStampedIndex = -1;

/* ---------- Helpers ---------- */
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

function triggerHaptic(ms = 22) {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

function setBoothLed(ledState, labelText) {
  els.boothLed.dataset.state = ledState;
  els.boothLedLabel.textContent = labelText;
}

function syncSoundUI() {
  const on = isSoundEnabled();
  state.session.soundEnabled = on;
  els.labelSoundToggle.textContent = `Sound: ${on ? 'On' : 'Off'}`;
  els.btnSoundToggle.setAttribute('aria-pressed', String(!on));
}

/* ---------- Sliding Pill Indicators ---------- */
function positionSlidingIndicator(container, activeSelector, indicatorSelector) {
  if (!container) return;
  const indicator = container.querySelector(indicatorSelector);
  const active = container.querySelector(activeSelector);
  if (!indicator || !active) return;

  const cRect = container.getBoundingClientRect();
  const aRect = active.getBoundingClientRect();
  if (aRect.width === 0) return;

  if (indicatorSelector === '.seg-indicator') {
    const left = active.offsetLeft - 3;
    indicator.style.width = `${aRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  } else {
    indicator.style.width = `${aRect.width}px`;
    indicator.style.height = `${aRect.height}px`;
    indicator.style.transform = `translate(${aRect.left - cRect.left}px, ${aRect.top - cRect.top}px)`;
  }
}

function syncAllIndicators() {
  requestAnimationFrame(() => {
    positionSlidingIndicator(els.poseCountGroup, '.seg-btn.is-active', '.seg-indicator');
    positionSlidingIndicator(els.timerGroup, '.seg-btn.is-active', '.seg-indicator');
    positionSlidingIndicator(els.layoutGroup, '.layout-btn.is-active', '.layout-indicator');
  });
}

/* ---------- Screen Switching (View Transitions API + fallback) ---------- */
function applyScreenDOM(screen) {
  state.screen = screen;
  els.viewBooth.hidden = screen !== 'booth';
  els.viewPrinting.hidden = screen !== 'printing';
  els.viewEditor.hidden = screen !== 'editor';
  els.headerHistory.hidden = screen !== 'editor';

  if (screen === 'editor') {
    els.viewEditor.classList.remove('is-entering');
    void els.viewEditor.offsetWidth;
    els.viewEditor.classList.add('is-entering');
    renderThemeGrid(els.editorThemeGrid, state.captures);
    scheduleRender();
    syncEditorControls();
  }
}

async function setScreen(screen) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && typeof document.startViewTransition === 'function') {
    const transition = document.startViewTransition(() => {
      applyScreenDOM(screen);
    });
    await transition.finished.catch(() => {});
  } else {
    applyScreenDOM(screen);
  }
}

/* ---------- Camera Lifecycle ---------- */
async function initCameraStream() {
  captureController.useDemoMode = false;
  setBoothLed('idle', 'CONNECTING');
  els.cameraState.hidden = false;
  els.cameraStateEyebrow.textContent = 'CAMERA ACCESS';
  els.cameraStateTitle.textContent = 'Connecting lens...';
  els.cameraStateDesc.textContent = 'Allow camera permission in your browser to begin.';

  try {
    await startCamera(els.cameraVideo, state.session.facingMode);
    els.cameraState.hidden = true;
    setBoothLed('idle', 'STANDBY');
    applyLiveVideoPreviewStyle();
  } catch (err) {
    setBoothLed('idle', 'OFFLINE');
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
  syncAllIndicators();
}

/* ---------- Mobile Bottom Sheet Placement & Snap Points ---------- */
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
  syncAllIndicators();
}

function setupMobileSheetDrag() {
  let startY = 0;
  let dragging = false;

  els.mobileSheetHandle.addEventListener('pointerdown', (e) => {
    dragging = true;
    startY = e.clientY;
    els.mobileSheetHandle.setPointerCapture?.(e.pointerId);
  });

  els.mobileSheetHandle.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    const dy = e.clientY - startY;
    if (dy < -36) {
      els.mobileSheet.dataset.snap = 'full';
    } else if (dy > 90 && els.mobileSheet.dataset.snap === 'half') {
      els.mobileSheetBackdrop.hidden = true;
      els.btnMobileSettings.setAttribute('aria-expanded', 'false');
    } else if (dy > 36) {
      els.mobileSheet.dataset.snap = 'half';
    }
    syncAllIndicators();
  });
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
      if (i === lastStampedIndex) {
        box.classList.add('is-stamped');
      }
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

async function showFreezeSnapshot(thumbUrl) {
  if (!thumbUrl) return;
  els.freezeSnapshot.src = thumbUrl;
  els.freezeSnapshot.hidden = false;
  els.freezeSnapshot.classList.remove('is-shrinking');
  await new Promise((r) => setTimeout(r, 240));
  els.freezeSnapshot.classList.add('is-shrinking');
  await new Promise((r) => setTimeout(r, 360));
  els.freezeSnapshot.hidden = true;
  els.freezeSnapshot.classList.remove('is-shrinking');
}

function showCountdownTick(num) {
  const isFinal = num === 1;
  els.countdownNumber.textContent = String(num);
  els.countdownNumber.classList.remove('is-visible');
  void els.countdownNumber.offsetWidth;
  els.countdownNumber.classList.add('is-visible');
  els.boothMachine.classList.toggle('is-final-second', isFinal);
  playCountdownTick(isFinal);
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

  els.boothMachine.classList.remove('is-final-second');
  els.countdownNumber.textContent = '';
  triggerFlash();
  playShutterThunk();
  triggerHaptic(28);

  const shouldMirror = state.session.mirrored && state.session.facingMode === 'user';
  const shot = (captureController.useDemoMode || !hasActiveCamera())
    ? await generateStudioTestFrame(poseIndex, total)
    : await captureVideoFrame(els.cameraVideo, shouldMirror);

  await showFreezeSnapshot(shot.thumbUrl);
  return shot;
}

async function startCaptureSession(singleRetakeIndex = null) {
  ensureAudioContext();
  triggerHaptic(18);
  els.mobileSheetBackdrop.hidden = true;
  setBoothLed('shooting', 'SHOOTING');

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
  lastStampedIndex = -1;

  if (singleRetakeIndex !== null) {
    els.retakeBanner.hidden = false;
    els.retakePoseNum.textContent = String(singleRetakeIndex + 1);
    const shot = await runCountdownAndSnap(singleRetakeIndex, state.session.poseCount);
    els.retakeBanner.hidden = true;
    if (shot && !captureController.cancelled) {
      const old = state.captures[singleRetakeIndex];
      if (old?.bitmap?.close) old.bitmap.close();
      state.captures[singleRetakeIndex] = { id: `cap_${Date.now()}`, ...shot };
      lastStampedIndex = singleRetakeIndex;
      finishCaptureToEditor();
    }
    return;
  }

  clearCaptures();
  state.edits = createDefaultEdits(state.session.layout, state.session.preFilter, state.session.themeId);
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
    lastStampedIndex = state.captures.length - 1;
    renderProgressBoxes(state.captures.length);
    if (state.captures.length < total) {
      await new Promise((r) => setTimeout(r, 340));
    }
  }

  captureController.running = false;
  els.btnMobileStart.disabled = false;

  if (captureController.cancelled) {
    setBoothLed('idle', 'STANDBY');
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
  setBoothLed('printing', 'PRINTING');
  await setScreen('printing');

  await playPrintSequence(state, {
    printerMachine: els.printerMachine,
    printerLed: els.printerLed,
    printerSlotGlow: els.printerSlotGlow,
    printingStatus: els.printingStatus,
    printingCaption: els.printingCaption,
    printedStripCard: els.printedStripCard,
    printingCanvas: els.printingCanvas,
    developingVeilLayer: els.developingVeilLayer,
    lightSweep: els.lightSweep,
    dustLayer: els.dustLayer,
    btnSkipPrint: els.btnSkipPrint,
  });

  await finishCaptureToEditor();
}

async function finishCaptureToEditor() {
  els.setupPanel.hidden = false;
  els.capturePanel.hidden = true;
  els.btnMobileStart.disabled = false;
  setBoothLed('ready', 'READY');
  stopCamera();
  await setScreen('editor');
}

/* ---------- Editor Controls Construction & Sync ---------- */
function buildEditorControls() {
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
        <span class="mono-meta tabular" id="val-adj-${spec.key}">${state.edits.adjustments[spec.key]}</span>
      </div>
      <input type="range" id="adj-${spec.key}" min="${spec.min}" max="${spec.max}" value="${state.edits.adjustments[spec.key]}" />
    `;
    const input = wrap.querySelector('input');
    input.addEventListener('pointerdown', () => pushHistory());
    input.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.edits.adjustments[spec.key] = val;
      wrap.querySelector(`#val-adj-${spec.key}`).textContent = String(val);
      scheduleRender();
    });
    els.adjustSliders.appendChild(wrap);
  }

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

  // 4. Sticker packs, search, recent & custom uploads
  renderStickerPackTabs();
  renderStickerCategory();
  renderRecentStickers();

  // 4b. Caption presets & Scene frames
  if (els.captionPresets) {
    els.captionPresets.innerHTML = '';
    for (const capText of MIDNIGHT_CAPTIONS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip-btn';
      b.textContent = capText;
      b.addEventListener('click', () => {
        pushHistory();
        state.edits.frame.caption = capText;
        syncEditorControls();
        scheduleRender();
      });
      els.captionPresets.appendChild(b);
    }
  }
  if (els.sceneFrameGroup) {
    els.sceneFrameGroup.innerHTML = '';
    for (const sf of SCENE_FRAMES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip-btn';
      b.dataset.sceneFrame = sf.id;
      b.textContent = sf.label;
      b.addEventListener('click', () => {
        pushHistory();
        state.edits.frame.sceneFrame = sf.id;
        syncEditorControls();
        scheduleRender();
      });
      els.sceneFrameGroup.appendChild(b);
    }
  }

  // 5. Theme grids (Setup & Editor)
  renderThemeGrid(els.setupThemeGrid, []);
  renderThemeGrid(els.editorThemeGrid, []);

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

function renderThemeGrid(container, captures = []) {
  if (!container) return;
  const activeId = state.screen === 'editor' ? state.edits.themeId : state.session.themeId;
  container.innerHTML = '';

  for (const theme of STRIP_THEMES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-card';
    if (theme.id === activeId) btn.classList.add('is-active');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(theme.id === activeId));
    btn.setAttribute('aria-label', `${theme.name} theme: ${theme.tagline}`);
    btn.dataset.themeId = theme.id;

    const canvas = document.createElement('canvas');
    canvas.className = 'theme-mini-canvas';
    renderThemeMiniPreview(canvas, theme, captures);

    const name = document.createElement('span');
    name.className = 'theme-card-name';
    name.textContent = theme.name;

    btn.appendChild(canvas);
    btn.appendChild(name);
    btn.addEventListener('click', () => {
      applyThemeSelection(theme.id, state.screen === 'editor');
      activeStickerCat = theme.packId;
      syncSetupUI();
      renderThemeGrid(els.setupThemeGrid, []);
      renderThemeGrid(els.editorThemeGrid, state.captures);
      renderStickerPackTabs();
      renderStickerCategory();
      if (state.screen === 'editor') {
        syncEditorControls();
        scheduleRender();
      }
    });
    container.appendChild(btn);
  }
}

function pickRandomTheme(gridEl) {
  const currentId = state.screen === 'editor' ? state.edits.themeId : state.session.themeId;
  const pool = STRIP_THEMES.filter((t) => t.id !== currentId);
  const chosen = pool[Math.floor(Math.random() * pool.length)] || STRIP_THEMES[0];
  applyThemeSelection(chosen.id, state.screen === 'editor');
  activeStickerCat = chosen.packId;
  syncSetupUI();
  renderThemeGrid(els.setupThemeGrid, []);
  renderThemeGrid(els.editorThemeGrid, state.captures);
  renderStickerPackTabs();
  renderStickerCategory();
  const card = gridEl?.querySelector(`[data-theme-id="${chosen.id}"]`);
  if (card) card.classList.add('is-shuffling');
  if (state.screen === 'editor') {
    syncEditorControls();
    scheduleRender();
  }
  showToast(`Theme: ${chosen.name}`);
}

function getOrderedPacks() {
  const theme = getThemeById(state.screen === 'editor' ? state.edits.themeId : state.session.themeId);
  const packs = [...STICKER_PACKS];
  packs.sort((a, b) => (a.id === theme.packId ? -1 : b.id === theme.packId ? 1 : 0));
  return packs;
}

function renderStickerPackTabs() {
  if (!els.stickerCatTabs) return;
  els.stickerCatTabs.innerHTML = '';

  const favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'pack-tab-btn';
  favBtn.setAttribute('role', 'tab');
  favBtn.dataset.cat = '__favs__';
  favBtn.setAttribute('aria-label', 'Favorites pack');
  favBtn.innerHTML = `<span>★ Favs</span>`;
  favBtn.addEventListener('click', () => {
    activeStickerCat = '__favs__';
    renderStickerCategory();
  });
  els.stickerCatTabs.appendChild(favBtn);

  for (const pack of getOrderedPacks()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pack-tab-btn';
    btn.setAttribute('role', 'tab');
    btn.dataset.cat = pack.id;
    btn.setAttribute('aria-label', `${pack.name} sticker pack`);
    btn.innerHTML = `${pack.iconSvg}<span>${pack.name}</span>`;
    btn.addEventListener('click', () => {
      activeStickerCat = pack.id;
      renderStickerCategory();
    });
    els.stickerCatTabs.appendChild(btn);
  }

  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.className = 'pack-tab-btn';
  customBtn.setAttribute('role', 'tab');
  customBtn.dataset.cat = '__custom__';
  customBtn.setAttribute('aria-label', 'Uploaded custom stickers');
  customBtn.textContent = 'My Uploads';
  customBtn.addEventListener('click', () => {
    activeStickerCat = '__custom__';
    renderStickerCategory();
  });
  els.stickerCatTabs.appendChild(customBtn);
}

function renderRecentStickers() {
  if (!els.stickerRecentWrap || !els.stickerRecentRow) return;
  const recentIds = getRecentStickerIds();
  if (recentIds.length === 0) {
    els.stickerRecentWrap.hidden = true;
    return;
  }
  els.stickerRecentWrap.hidden = false;
  els.stickerRecentRow.innerHTML = '';
  for (const id of recentIds) {
    const def = ALL_STICKERS.find((s) => s.id === id);
    if (!def) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sticker-pick-btn';
    btn.setAttribute('aria-label', `Add recent ${def.label}`);
    btn.innerHTML = renderStickerSvg(def.id);
    btn.addEventListener('click', () => {
      addStickerOverlay(def.id);
      renderRecentStickers();
    });
    els.stickerRecentRow.appendChild(btn);
  }
}

function renderStickerCategory() {
  for (const btn of els.stickerCatTabs.querySelectorAll('.pack-tab-btn')) {
    const active = btn.dataset.cat === activeStickerCat;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  }
  els.stickerGrid.innerHTML = '';
  const favs = getFavoriteStickerIds();

  if (activeStickerCat === '__custom__' && !stickerSearchQuery) {
    const customs = getCustomStickers();
    if (customs.length === 0) {
      els.stickerGrid.innerHTML = '<div class="empty-note" style="grid-column:1/-1;">Upload a PNG or SVG to save your own sticker locally.</div>';
      return;
    }
    for (const c of customs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sticker-pick-btn';
      btn.setAttribute('aria-label', `Add custom sticker ${c.label}`);
      btn.innerHTML = `<img src="${c.dataUrl}" alt="${c.label}" />`;
      btn.addEventListener('click', () => addStickerOverlay(c.id));

      const bgDot = document.createElement('span');
      bgDot.className = `sticker-fav-dot ${state.edits.frame.customBgId === c.id ? 'is-fav' : ''}`;
      bgDot.textContent = 'BG';
      bgDot.title = 'Use as strip background';
      bgDot.addEventListener('click', (ev) => {
        ev.stopPropagation();
        pushHistory();
        state.edits.frame.customBgId = state.edits.frame.customBgId === c.id ? null : c.id;
        renderStickerCategory();
        scheduleRender();
      });
      btn.appendChild(bgDot);
      els.stickerGrid.appendChild(btn);
    }
    return;
  }

  let items = [];
  if (stickerSearchQuery) {
    const q = stickerSearchQuery.toLowerCase();
    items = ALL_STICKERS.filter((s) => s.label.toLowerCase().includes(q));
  } else if (activeStickerCat === '__favs__') {
    items = ALL_STICKERS.filter((s) => favs.includes(s.id));
    if (items.length === 0) {
      els.stickerGrid.innerHTML = '<div class="empty-note" style="grid-column:1/-1;">Star any sticker to pin it to Favorites.</div>';
      return;
    }
  } else {
    items = ALL_STICKERS.filter((s) => s.packId === activeStickerCat);
  }

  for (const st of items) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sticker-pick-btn';
    btn.title = st.label;
    btn.setAttribute('aria-label', `Add ${st.label} sticker`);
    btn.innerHTML = renderStickerSvg(st.id);

    const star = document.createElement('span');
    star.className = `sticker-fav-dot ${favs.includes(st.id) ? 'is-fav' : ''}`;
    star.textContent = '★';
    star.title = 'Toggle favorite';
    star.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleFavoriteSticker(st.id);
      renderStickerCategory();
    });

    btn.appendChild(star);
    btn.addEventListener('click', () => {
      addStickerOverlay(st.id);
      renderRecentStickers();
    });
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

  els.btnUndo.disabled = !canUndo();
  els.btnRedo.disabled = !canRedo();

  for (const btn of els.editorFilterGrid.querySelectorAll('.filter-card')) {
    btn.classList.toggle('is-active', btn.dataset.filter === edits.filter);
  }

  for (const key of Object.keys(DEFAULT_ADJUSTMENTS)) {
    const input = $(`adj-${key}`);
    const valEl = $(`val-adj-${key}`);
    if (input && valEl) {
      input.value = edits.adjustments[key];
      valEl.textContent = String(edits.adjustments[key]);
    }
  }

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

  if (els.sceneFrameGroup) {
    for (const btn of els.sceneFrameGroup.querySelectorAll('.chip-btn')) {
      btn.classList.toggle('is-active', btn.dataset.sceneFrame === (edits.frame.sceneFrame || 'none'));
    }
  }
  if (els.btnLightLeak) {
    els.btnLightLeak.classList.toggle('is-active', Boolean(edits.frame.lightLeak));
    els.btnLightLeak.textContent = `Light Leak: ${edits.frame.lightLeak ? 'On' : 'Off'}`;
    els.btnLightLeak.setAttribute('aria-pressed', String(Boolean(edits.frame.lightLeak)));
  }
  if (els.btnTitleCardExport) {
    els.btnTitleCardExport.classList.toggle('is-active', Boolean(edits.frame.titleCardExport));
    els.btnTitleCardExport.textContent = `Title Card Header: ${edits.frame.titleCardExport ? 'On' : 'Off'}`;
    els.btnTitleCardExport.setAttribute('aria-pressed', String(Boolean(edits.frame.titleCardExport)));
  }
  if (els.btnMatchFilmLook) {
    els.btnMatchFilmLook.classList.toggle('is-active', Boolean(state.session.matchFilmLook));
    els.btnMatchFilmLook.setAttribute('aria-pressed', String(Boolean(state.session.matchFilmLook)));
  }

  els.btnDrawMode.classList.toggle('is-active', drawTool.active);
  els.btnDrawMode.textContent = `Pen: ${drawTool.active ? 'On' : 'Off'}`;
  els.btnDrawMode.setAttribute('aria-pressed', String(drawTool.active));
  els.btnEraserMode.classList.toggle('is-active', drawTool.eraser);
  els.btnEraserMode.textContent = `Eraser: ${drawTool.eraser ? 'On' : 'Off'}`;
  for (const btn of els.penColors.querySelectorAll('.swatch-btn')) {
    btn.classList.toggle('is-active', btn.dataset.penColor === drawTool.color);
  }

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

  els.btnSoundToggle.addEventListener('click', () => {
    setSoundEnabled(!isSoundEnabled());
    syncSoundUI();
  });

  els.btnFilmMode?.addEventListener('click', () => {
    state.session.filmMode = !state.session.filmMode;
    try { localStorage.setItem('mistletoe_film_mode', String(state.session.filmMode)); } catch {}
    syncFilmModeUI();
  });

  els.btnCrackleToggle?.addEventListener('click', () => {
    ensureAudioContext();
    const on = setCrackleEnabled(!isCrackleEnabled());
    els.btnCrackleToggle.textContent = `Crackle: ${on ? 'On' : 'Off'}`;
    els.btnCrackleToggle.setAttribute('aria-pressed', String(on));
  });

  els.btnLightLeak?.addEventListener('click', () => {
    pushHistory();
    state.edits.frame.lightLeak = !state.edits.frame.lightLeak;
    syncEditorControls();
    scheduleRender();
  });

  els.btnTitleCardExport?.addEventListener('click', () => {
    pushHistory();
    state.edits.frame.titleCardExport = !state.edits.frame.titleCardExport;
    syncEditorControls();
    scheduleRender();
  });

  els.btnMatchFilmLook?.addEventListener('click', () => {
    state.session.matchFilmLook = !state.session.matchFilmLook;
    syncEditorControls();
    scheduleRender();
  });

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

  els.btnMobileSettings.addEventListener('click', () => {
    els.mobileSheet.dataset.snap = 'half';
    els.mobileSheetBackdrop.hidden = false;
    els.btnMobileSettings.setAttribute('aria-expanded', 'true');
    syncAllIndicators();
  });

  els.btnCloseSheet.addEventListener('click', () => {
    els.mobileSheetBackdrop.hidden = true;
    els.btnMobileSettings.setAttribute('aria-expanded', 'false');
  });

  els.mobileSheetBackdrop.addEventListener('click', (e) => {
    if (e.target === els.mobileSheetBackdrop) {
      els.mobileSheetBackdrop.hidden = true;
      els.btnMobileSettings.setAttribute('aria-expanded', 'false');
    }
  });

  els.btnRetryCamera.addEventListener('click', () => initCameraStream());
  els.btnDemoFrames.addEventListener('click', () => {
    captureController.useDemoMode = true;
    els.cameraState.hidden = true;
    setBoothLed('idle', 'TEST MODE');
    showToast('Studio test frames ready. Press Start Session.');
  });

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

  els.editorTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    switchEditorTab(btn.dataset.tab);
  });

  // Arrow-key accessibility on tablists
  const enableArrowTabs = (tablist) => {
    tablist?.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      const idx = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      const next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      next.click();
    });
  };
  enableArrowTabs(els.editorTabs);
  enableArrowTabs(els.stickerCatTabs);

  els.btnRandomThemeSetup?.addEventListener('click', () => pickRandomTheme(els.setupThemeGrid));
  els.btnRandomThemeEditor?.addEventListener('click', () => pickRandomTheme(els.editorThemeGrid));

  els.inputStickerSearch?.addEventListener('input', (e) => {
    stickerSearchQuery = e.target.value.trim();
    renderStickerCategory();
  });

  els.btnSurpriseStickers?.addEventListener('click', () => {
    scatterSurpriseStickers();
    showToast('Scattered theme stickers!');
  });

  els.btnUploadSticker?.addEventListener('click', () => {
    els.inputStickerUpload?.click();
  });

  els.inputStickerUpload?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const saved = await saveCustomStickerFile(file);
    activeStickerCat = '__custom__';
    renderStickerCategory();
    addStickerOverlay(saved.id);
    e.target.value = '';
    showToast('Custom sticker added!');
  });

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
    await setScreen('booth');
    await initCameraStream();
    startCaptureSession(idx);
  });

  els.btnDeselectPhoto.addEventListener('click', () => {
    state.selection = { type: null, id: null };
    syncEditorControls();
    scheduleRender();
  });

  els.btnUndo.addEventListener('click', () => {
    if (undo()) { syncEditorControls(); scheduleRender(); }
  });

  els.btnRedo.addEventListener('click', () => {
    if (redo()) { syncEditorControls(); scheduleRender(); }
  });

  els.btnResetEdits.addEventListener('click', () => {
    resetEdits();
    syncEditorControls();
    scheduleRender();
    showToast('Edits reset to studio default.');
  });

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

  // Replay print animation
  els.btnReplayPrint.addEventListener('click', async () => {
    ensureAudioContext();
    await runPrintingSequence();
  });

  // Mobile Edit scroll focus
  els.btnFocusEditor.addEventListener('click', () => {
    els.editorToolsCol.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.btnTakeAgain.addEventListener('click', async () => {
    clearCaptures();
    await setScreen('booth');
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
        await setScreen('booth');
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

function syncFilmModeUI() {
  const on = Boolean(state.session.filmMode);
  if (on) {
    document.documentElement.setAttribute('data-skin', 'midnight');
  } else {
    document.documentElement.removeAttribute('data-skin');
  }
  if (els.btnFilmMode) {
    els.btnFilmMode.textContent = `Film Mode: ${on ? 'On' : 'Off'}`;
    els.btnFilmMode.setAttribute('aria-pressed', String(on));
  }
  applyThemeToAppUI(getThemeById(state.screen === 'editor' ? state.edits.themeId : state.session.themeId));
}

async function runTitleCardIntroOnce() {
  if (!state.session.filmMode || !els.titleCardOverlay) return;
  try {
    if (sessionStorage.getItem('mistletoe_intro_seen') === '1') return;
    sessionStorage.setItem('mistletoe_intro_seen', '1');
  } catch {
    // Ignore storage restrictions
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  els.titleCardOverlay.hidden = false;
  await new Promise((resolve) => {
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      els.titleCardOverlay.hidden = true;
      els.btnSkipIntro?.removeEventListener('click', finish);
      resolve();
    };
    els.btnSkipIntro?.addEventListener('click', finish);

    let count = 3;
    els.introLeaderNum.textContent = String(count);
    const timer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timer);
        finish();
      } else {
        els.introLeaderNum.textContent = String(count);
      }
    }, 750);
  });
}

  await loadCustomStickers();
  syncFilmModeUI();
  startFilmFX(els.filmFxCanvas, () => ({ filmMode: state.session.filmMode, screen: state.screen }));
  activeStickerCat = getThemeById(state.session.themeId).packId;
  syncSoundUI();
  buildEditorControls();
  syncResponsiveSetupPlacement();
  setupMobileSheetDrag();
  syncSetupUI();
  bindEvents();
  runTitleCardIntroOnce();
  await initCameraStream();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

bootstrap();
