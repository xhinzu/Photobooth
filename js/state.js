/**
 * Central state store with non-destructive edit history (undo/redo) and Strip Themes.
 */

import { getThemeById, loadSavedThemeId, saveThemeId, applyThemeToAppUI } from './themes.js';

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
  { id: 'night', label: 'Midnight Black', color: '#07070A' },
  { id: 'navy', label: 'Deep Navy', color: '#0E1230' },
  { id: 'red', label: 'Christmas Red', color: '#8C1520' },
  { id: 'pine', label: 'Pine Green', color: '#0F4D2B' },
  { id: 'white', label: 'Warm White', color: '#FFF4E0' },
  { id: 'black', label: 'Carbon Black', color: '#141418' },
  { id: 'gold', label: 'Festive Gold', color: '#33260B' },
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

export function createDefaultEdits(layout = 'single', filter = null, themeId = loadSavedThemeId()) {
  const theme = getThemeById(themeId);
  return {
    themeId: theme.id,
    filter: filter || theme.defaults.filter,
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      ...(theme.defaults.adjustments || {}),
    },
    frame: {
      layout,
      bgColor: theme.background.color,
      borderWidth: theme.border.thickness,
      cornerRadius: theme.border.radius,
      caption: theme.caption.defaultText || '',
      captionFont: theme.caption.font || 'mono',
      showDate: true,
      showBranding: true,
      sceneFrame: 'none',
      lightLeak: false,
      titleCardExport: false,
      customBgId: null,
    },
    perPhoto: {},
    overlays: [],
    strokes: [],
  };
}

const initialThemeId = loadSavedThemeId();
const loadFilmMode = () => {
  try {
    const v = localStorage.getItem('mistletoe_film_mode');
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
};

export const state = {
  screen: 'booth',
  session: {
    poseCount: 4,
    layout: 'single',
    timerSeconds: 3,
    preFilter: 'color',
    themeId: initialThemeId,
    filmMode: false,
    matchFilmLook: false,
    facingMode: 'user',
    mirrored: true,
    soundEnabled: true,
  },
  captures: [],
  edits: createDefaultEdits('single', null, initialThemeId),
  selection: {
    type: null,
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

export function applyThemeSelection(themeId, recordHistory = true) {
  const theme = getThemeById(themeId);
  state.session.themeId = theme.id;
  state.session.preFilter = theme.defaults.filter;
  saveThemeId(theme.id);
  applyThemeToAppUI(theme);

  if (state.screen === 'editor' || state.captures.length > 0) {
    if (recordHistory) pushHistory();
    state.edits.themeId = theme.id;
    state.edits.filter = theme.defaults.filter;
    state.edits.adjustments = {
      ...state.edits.adjustments,
      ...(theme.defaults.adjustments || {}),
    };
    state.edits.frame.bgColor = theme.background.color;
    state.edits.frame.borderWidth = theme.border.thickness;
    state.edits.frame.cornerRadius = theme.border.radius;
    state.edits.frame.captionFont = theme.caption.font;
    state.edits.frame.caption = theme.caption.defaultText || '';
  }
  notify('theme');
  return theme;
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
  const theme = getThemeById(state.edits.themeId);
  applyThemeToAppUI(theme);
  notify('history');
  return true;
}

export function redo() {
  if (!canRedo()) return false;
  state.history.past.push(cloneEdits(state.edits));
  state.edits = state.history.future.pop();
  state.selection = { type: null, id: null };
  const theme = getThemeById(state.edits.themeId);
  applyThemeToAppUI(theme);
  notify('history');
  return true;
}

export function resetEdits() {
  pushHistory();
  state.edits = createDefaultEdits(state.session.layout, null, state.session.themeId);
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
