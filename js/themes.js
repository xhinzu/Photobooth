/**
 * Pure-data Strip Theme definitions.
 * Adding a new theme requires only adding one object to STRIP_THEMES.
 */

const THEME_STORAGE_KEY = 'mistletoe_active_theme';

export const MIDNIGHT_CAPTIONS = [
  'A CHRISTMAS TO REMEMBER',
  'The Night Before',
  'Naughty or Nice?',
  'No Presents Were Harmed',
  'Silent Night, Smirking Faces',
  'Fin.',
];

export const SCENE_FRAMES = [
  { id: 'none', label: 'None' },
  { id: 'rooftop', label: 'Snowy Rooftop' },
  { id: 'stockings', label: 'Hanging Stockings' },
  { id: 'window', label: 'Snowy Window' },
  { id: 'poster', label: 'Film Poster' },
];

export const STRIP_THEMES = [
  {
    id: 'holiday-lights',
    name: 'Holiday Lights',
    tagline: 'Black strip, fairy-light border & gold frame',
    accentColor: '#E8283A',
    accentHover: '#FFC83D',
    packId: 'christmas',
    background: {
      type: 'solid',
      color: '#07070A',
    },
    border: {
      style: 'fairy-lights',
      color: '#FFC83D',
      thickness: 24,
      radius: 4,
    },
    photoFrame: {
      shape: 'gold-frame',
      tiltMaxDeg: 0,
      shadow: true,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'color',
      adjustments: { grain: 8, vignette: 12, warmth: 6 },
    },
    caption: {
      font: 'sans',
      color: '#FFF4E0',
      defaultText: 'Merry & Bright',
    },
    overlay: {
      type: 'snow',
      layer: 'above',
    },
  },
  {
    id: 'midnight-reel',
    name: 'Midnight Reel',
    tagline: '1940s B&W film, sprockets & snow',
    accentColor: '#EDEBE6',
    accentHover: '#FFFFFF',
    packId: 'scoundrel',
    background: {
      type: 'solid',
      color: '#0B0B0C',
    },
    border: {
      style: 'sprocket',
      color: '#EDEBE6',
      thickness: 24,
      radius: 0,
    },
    photoFrame: {
      shape: 'double-ink',
      tiltMaxDeg: 0,
      shadow: false,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'hc-bw',
      adjustments: { grain: 32, vignette: 28, warmth: 0 },
    },
    caption: {
      font: 'mono',
      color: '#EDEBE6',
      defaultText: 'A CHRISTMAS TO REMEMBER',
    },
    overlay: {
      type: 'midnight-snow',
      layer: 'above',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Cream paper, thin ink border',
    accentColor: '#B53D2A',
    accentHover: '#962F1F',
    packId: 'classics',
    background: {
      type: 'solid',
      color: '#FFFDF9',
    },
    border: {
      style: 'solid',
      color: '#161412',
      thickness: 16,
      radius: 2,
    },
    photoFrame: {
      shape: 'rect',
      tiltMaxDeg: 0,
      shadow: false,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'bw',
      adjustments: { grain: 12, vignette: 10, warmth: 0 },
    },
    caption: {
      font: 'mono',
      color: '#161412',
      defaultText: '',
    },
    overlay: {
      type: 'none',
      layer: 'above',
    },
  },
  {
    id: 'y2k',
    name: 'Y2K',
    tagline: 'Icy chrome, pixel stars & gloss',
    accentColor: '#3A7BD5',
    accentHover: '#2B62B0',
    packId: 'y2k',
    background: {
      type: 'gradient',
      color: '#DCEEFF',
      secondary: '#E6E9F2',
    },
    border: {
      style: 'chrome',
      color: '#9FB8D6',
      thickness: 18,
      radius: 10,
    },
    photoFrame: {
      shape: 'rounded',
      tiltMaxDeg: 0,
      shadow: true,
      glossy: true,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'cool',
      adjustments: { grain: 6, vignette: 8, warmth: -10 },
    },
    caption: {
      font: 'display',
      color: '#23447A',
      defaultText: 'xoxo 2026',
    },
    overlay: {
      type: 'sparkles',
      layer: 'above',
    },
  },
  {
    id: 'christmas',
    name: 'Christmas',
    tagline: 'Candy-cane stripe & snowfall',
    accentColor: '#A62626',
    accentHover: '#871C1C',
    packId: 'christmas',
    background: {
      type: 'solid',
      color: '#1E3F2B',
    },
    border: {
      style: 'candy-cane',
      color: '#B53D2A',
      thickness: 20,
      radius: 4,
    },
    photoFrame: {
      shape: 'rect',
      tiltMaxDeg: 0,
      shadow: true,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'warm',
      adjustments: { grain: 14, vignette: 16, warmth: 14 },
    },
    caption: {
      font: 'sans',
      color: '#FFFDF9',
      defaultText: 'Merry & Bright',
    },
    overlay: {
      type: 'snow',
      layer: 'above',
    },
  },
  {
    id: 'film-noir',
    name: 'Film Noir',
    tagline: '35mm sprockets & heavy grain',
    accentColor: '#3B3632',
    accentHover: '#161412',
    packId: 'retro',
    background: {
      type: 'solid',
      color: '#141312',
    },
    border: {
      style: 'sprocket',
      color: '#F2ECE4',
      thickness: 24,
      radius: 0,
    },
    photoFrame: {
      shape: 'rect',
      tiltMaxDeg: 0,
      shadow: false,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'hc-bw',
      adjustments: { grain: 38, vignette: 32, warmth: 0 },
    },
    caption: {
      font: 'mono',
      color: '#F2ECE4',
      defaultText: 'KODAK 400TX',
    },
    overlay: {
      type: 'sprocket-numbers',
      layer: 'above',
    },
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    tagline: 'Thick-bottom instant frames',
    accentColor: '#9E5B40',
    accentHover: '#7D452F',
    packId: 'classics',
    background: {
      type: 'solid',
      color: '#F4EDE4',
    },
    border: {
      style: 'solid',
      color: '#D8CEC2',
      thickness: 18,
      radius: 2,
    },
    photoFrame: {
      shape: 'polaroid',
      tiltMaxDeg: 2.2,
      shadow: true,
      glossy: false,
      polaroidPadBottom: 26,
      tapeCorners: false,
      perPhotoCaption: true,
    },
    defaults: {
      filter: 'faded',
      adjustments: { grain: 16, vignette: 14, warmth: 8 },
    },
    caption: {
      font: 'sans',
      color: '#2C2621',
      defaultText: 'instant memories',
    },
    overlay: {
      type: 'none',
      layer: 'above',
    },
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    tagline: 'Blush & lavender, scalloped edge',
    accentColor: '#C95B7A',
    accentHover: '#A84360',
    packId: 'kawaii',
    background: {
      type: 'gradient',
      color: '#FDE4EC',
      secondary: '#EAE2FA',
    },
    border: {
      style: 'scalloped',
      color: '#F3B6C8',
      thickness: 20,
      radius: 14,
    },
    photoFrame: {
      shape: 'rounded',
      tiltMaxDeg: 0,
      shadow: true,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'warm',
      adjustments: { grain: 6, vignette: 6, warmth: 6 },
    },
    caption: {
      font: 'sans',
      color: '#6A3049',
      defaultText: 'so cute together',
    },
    overlay: {
      type: 'hearts-stars',
      layer: 'above',
    },
  },
  {
    id: 'retro-diner',
    name: 'Retro Diner',
    tagline: 'Mustard, teal & checkerboard',
    accentColor: '#2A7B7B',
    accentHover: '#1D5C5C',
    packId: 'retro',
    background: {
      type: 'solid',
      color: '#FAF0D7',
    },
    border: {
      style: 'checkerboard',
      color: '#D49A2A',
      thickness: 20,
      radius: 4,
    },
    photoFrame: {
      shape: 'rect',
      tiltMaxDeg: 0,
      shadow: true,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: false,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'vintage',
      adjustments: { grain: 18, vignette: 16, warmth: 12 },
    },
    caption: {
      font: 'display',
      color: '#1E5656',
      defaultText: 'LATE NIGHT DINER',
    },
    overlay: {
      type: 'halftone',
      layer: 'below',
    },
  },
  {
    id: 'scrapbook',
    name: 'Scrapbook',
    tagline: 'Kraft paper & washi tape',
    accentColor: '#8B5A3C',
    accentHover: '#6B4229',
    packId: 'nature',
    background: {
      type: 'kraft',
      color: '#D7B996',
      secondary: '#C7A57E',
    },
    border: {
      style: 'torn',
      color: '#B8946D',
      thickness: 20,
      radius: 0,
    },
    photoFrame: {
      shape: 'rect',
      tiltMaxDeg: 1.8,
      shadow: true,
      glossy: false,
      polaroidPadBottom: 0,
      tapeCorners: true,
      perPhotoCaption: false,
    },
    defaults: {
      filter: 'sepia',
      adjustments: { grain: 20, vignette: 14, warmth: 10 },
    },
    caption: {
      font: 'sans',
      color: '#2A1E16',
      defaultText: 'core memories',
    },
    overlay: {
      type: 'doodles',
      layer: 'above',
    },
  },
];

export function getThemeById(id) {
  return STRIP_THEMES.find((t) => t.id === id) || STRIP_THEMES[0];
}

export function loadSavedThemeId() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved && STRIP_THEMES.some((t) => t.id === saved) ? saved : 'holiday-lights';
  } catch {
    return 'holiday-lights';
  }
}

export function saveThemeId(id) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    // Ignore storage errors
  }
}

export function applyThemeToAppUI(theme) {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accentColor);
  root.style.setProperty('--accent-hover', theme.accentHover);
}

