/**
 * Central state store with non-destructive edit history (undo/redo).
 */

export const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  grain: 12,
  vignette: 10,
  blur: 0,
  sharpness: 0,
};

export const PAPER_SWATCHES = [
  { id: 'cream', label: 'Studio Cream', color: '#FFFDF9' },
  { id: 'black', label: 'Carbon Black', color: '#161412' },
  { id: 'white', label: 'Bright White', color: '#FFFFFF' },
  { id: 'blush', label: 'Warm Blush', color: '#F3DDD7' },
  { id: 'sage', label: 'Muted Sage', color: '#D9E0D4' },
  { id: 'navy', label: 'Midnight Navy', color: '#1D2736' },
  { id: 'red', label: 'Terracotta Red', color: '#B53D2A' },
];

export const PEN_COLORS = [
  '#161412',
  '#FFFDF9',
  '#B53D2A',
  '#D48C46',
  '#3A5A40',
  '#264653',
];

function cloneEdits(edits) {
  return JSON.parse(JSON.stringify(edits));
}

export function createDefaultEdits(layout = 'single', filter = 'bw') {
  return {
    filter,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    frame: {
      layout,
      bgColor: '#FFFDF9',
      borderWidth: 18,
      cornerRadius: 2,
      caption: '',
      captionFont: 'mono',
      showDate: true,
      showBranding: true,
    },
    perPhoto: {},
    overlays: [],
    strokes: [],
  };
}

export const state = {
  screen: 'booth', // 'booth' | 'printing' | 'editor'
  session: {
    poseCount: 4,
    layout: 'single',
    timerSeconds: 3,
    preFilter: 'bw',
    facingMode: 'user',
    mirrored: true,
    soundEnabled: true,
  },
  captures: [], // { id, bitmap, thumbUrl }
  edits: createDefaultEdits('single', 'bw'),
  selection: {
    type: null, // 'overlay' | 'photo' | null
    id: null,
  },
  drawTool: {
    active: false,
    color: '#B53D2A',
    size: 4,
    eraser: false,
  },
  history: {
    past: [],
    future: [],
  },
};

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify(reason = 'update') {
  for (const fn of listeners) {
    fn(state, reason);
  }
}

export function pushHistory() {
  state.history.past.push(cloneEdits(state.edits));
  if (state.history.past.length > 40) {
    state.history.past.shift();
  }
  state.history.future = [];
}

export function canUndo() {
  return state.history.past.length > 0;
}

export function canRedo() {
  return state.history.future.length > 0;
}

export function undo() {
  if (!canUndo()) return false;
  state.history.future.push(cloneEdits(state.edits));
  state.edits = state.history.past.pop();
  state.selection = { type: null, id: null };
  notify('history');
  return true;
}

export function redo() {
  if (!canRedo()) return false;
  state.history.past.push(cloneEdits(state.edits));
  state.edits = state.history.future.pop();
  state.selection = { type: null, id: null };
  notify('history');
  return true;
}

export function resetEdits() {
  pushHistory();
  state.edits = createDefaultEdits(state.session.layout, state.session.preFilter);
  state.selection = { type: null, id: null };
  notify('reset');
}

export function clearCaptures() {
  for (const cap of state.captures) {
    if (cap.bitmap && typeof cap.bitmap.close === 'function') {
      cap.bitmap.close();
    }
    if (cap.thumbUrl && cap.thumbUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cap.thumbUrl);
    }
  }
  state.captures = [];
}

