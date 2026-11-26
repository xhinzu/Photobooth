/**
 * Hand-drawn inline SVG sticker library (crisp, no external assets).
 */

export const STICKER_CATEGORIES = [
  { id: 'hearts', label: 'Hearts & Bows' },
  { id: 'sparkles', label: 'Stars & Sparkles' },
  { id: 'holiday', label: 'Mistletoe & Flora' },
  { id: 'doodles', label: 'Tape & Doodles' },
  { id: 'labels', label: 'Labels' },
];

export const STICKERS = [
  // Hearts & Bows
  {
    id: 'heart-ink',
    category: 'hearts',
    label: 'Ink Heart',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M50 83C31 68 14 53 15 35c.8-12 10-20 20-19 7 .6 12 5 15 11 3-6 9-10 16-11 10-.7 19 8 19 20 0 18-17 32-35 47z" fill="#B53D2A" stroke="#161412" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'heart-double',
    category: 'hearts',
    label: 'Double Hearts',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M36 66C24 56 14 46 15 35c.5-8 7-13 13-12 4 .5 7 3 9 7 2-4 6-7 10-7 7 0 12 6 12 13 0 12-11 21-23 30z" fill="#F3DDD7" stroke="#161412" stroke-width="3" stroke-linejoin="round"/>
      <path d="M64 82C53 73 45 64 46 54c.5-7 6-11 11-10 4 .4 6 3 8 6 2-3 5-6 9-6 6 0 10 5 10 11 0 10-9 19-20 27z" fill="#B53D2A" stroke="#161412" stroke-width="3" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'bow-ribbon',
    category: 'hearts',
    label: 'Ribbon Bow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M46 48C32 32 14 27 14 42c0 14 19 16 32 8zm8 0c14-16 32-21 32-6 0 14-19 16-32 8z" fill="#B53D2A" stroke="#161412" stroke-width="3" stroke-linejoin="round"/>
      <path d="M46 53L31 81l11-4 6-22zm8 0l15 28-11-4-6-22z" fill="#B53D2A" stroke="#161412" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="50" cy="49" r="6" fill="#F6E9DC" stroke="#161412" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'bow-sketch',
    category: 'hearts',
    label: 'Sketch Bow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M47 46C31 28 16 31 18 45c2 11 18 11 29 3m6-2c16-18 31-15 29-1-2 11-18 11-29 3" stroke="#161412" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M48 52c-6 12-14 23-20 31m25-31c5 12 12 24 19 31" stroke="#161412" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="50" cy="49" r="5" fill="#161412"/>
    </svg>`,
  },

  // Stars & Sparkles
  {
    id: 'sparkle-four',
    category: 'sparkles',
    label: 'Four-Point Sparkle',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M50 10c2 26 14 38 40 40-26 2-38 14-40 40-2-26-14-38-40-40 26-2 38-14 40-40z" fill="#FFFDF9" stroke="#161412" stroke-width="3.2" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'sparkle-cluster',
    category: 'sparkles',
    label: 'Sparkle Cluster',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M42 18c1 17 9 25 26 26-17 1-25 9-26 26-1-17-9-25-26-26 17-1 25-9 26-26z" fill="#D48C46" stroke="#161412" stroke-width="3" stroke-linejoin="round"/>
      <path d="M76 58c1 9 5 13 14 14-9 1-13 5-14 14-1-9-5-13-14-14 9-1 13-5 14-14z" fill="#FFFDF9" stroke="#161412" stroke-width="2.6" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'star-doodle',
    category: 'sparkles',
    label: 'Doodle Star',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M51 14l10 24 25 2-19 17 6 25-22-13-22 13 6-25-19-17 25-2 10-24z" fill="#F6E9DC" stroke="#161412" stroke-width="3.4" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'moon-crescent',
    category: 'sparkles',
    label: 'Crescent Moon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M62 18c-20 4-32 24-27 45 4 16 18 26 34 25-14-5-21-19-18-35 3-14 12-26 24-31-4-3-8-4-13-4z" fill="#D48C46" stroke="#161412" stroke-width="3.2" stroke-linejoin="round"/>
    </svg>`,
  },

  // Mistletoe & Flora
  {
    id: 'mistletoe-sprig',
    category: 'holiday',
    label: 'Mistletoe Sprig',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M50 14v32m0 0c-12 6-23 16-28 28m28-28c11 8 21 18 26 30" stroke="#161412" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="29" cy="54" rx="14" ry="7" transform="rotate(-28 29 54)" fill="#587D58" stroke="#161412" stroke-width="2.8"/>
      <ellipse cx="70" cy="54" rx="14" ry="7" transform="rotate(28 70 54)" fill="#587D58" stroke="#161412" stroke-width="2.8"/>
      <circle cx="44" cy="54" r="6" fill="#FFFDF9" stroke="#161412" stroke-width="2.6"/>
      <circle cx="56" cy="56" r="6" fill="#FFFDF9" stroke="#161412" stroke-width="2.6"/>
      <circle cx="50" cy="64" r="6" fill="#FFFDF9" stroke="#161412" stroke-width="2.6"/>
    </svg>`,
  },
  {
    id: 'holly-berries',
    category: 'holiday',
    label: 'Holly & Berries',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M22 48c8-18 24-22 32-12-8 14-20 20-32 12zm56 0c-8-18-24-22-32-12 8 14 20 20 32 12z" fill="#3A5A40" stroke="#161412" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="45" cy="56" r="7" fill="#B53D2A" stroke="#161412" stroke-width="2.6"/>
      <circle cx="57" cy="57" r="7" fill="#B53D2A" stroke="#161412" stroke-width="2.6"/>
      <circle cx="50" cy="46" r="7" fill="#B53D2A" stroke="#161412" stroke-width="2.6"/>
    </svg>`,
  },
  {
    id: 'daisy-flower',
    category: 'holiday',
    label: 'Wild Daisy',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <g fill="#FFFDF9" stroke="#161412" stroke-width="2.8">
        <ellipse cx="50" cy="24" rx="8" ry="14"/>
        <ellipse cx="50" cy="76" rx="8" ry="14"/>
        <ellipse cx="24" cy="50" rx="14" ry="8"/>
        <ellipse cx="76" cy="50" rx="14" ry="8"/>
        <ellipse cx="31" cy="31" rx="8" ry="13" transform="rotate(-45 31 31)"/>
        <ellipse cx="69" cy="69" rx="8" ry="13" transform="rotate(-45 69 69)"/>
        <ellipse cx="69" cy="31" rx="8" ry="13" transform="rotate(45 69 31)"/>
        <ellipse cx="31" cy="69" rx="8" ry="13" transform="rotate(45 31 69)"/>
      </g>
      <circle cx="50" cy="50" r="11" fill="#D48C46" stroke="#161412" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'leaf-branch',
    category: 'holiday',
    label: 'Pressed Leaf',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M22 82C34 58 52 38 78 18" stroke="#161412" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="44" cy="50" rx="12" ry="6" transform="rotate(-55 44 50)" fill="#587D58" stroke="#161412" stroke-width="2.6"/>
      <ellipse cx="62" cy="56" rx="12" ry="6" transform="rotate(15 62 56)" fill="#587D58" stroke="#161412" stroke-width="2.6"/>
      <ellipse cx="64" cy="32" rx="11" ry="5.5" transform="rotate(-40 64 32)" fill="#587D58" stroke="#161412" stroke-width="2.6"/>
    </svg>`,
  },

  // Tape & Doodles
  {
    id: 'tape-kraft',
    category: 'doodles',
    label: 'Masking Tape',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" fill="none">
      <path d="M10 14l98-4-4 10 5 10-4 14-97 4 4-12-5-11 3-11z" fill="rgba(218, 194, 158, 0.88)" stroke="#161412" stroke-width="2.2"/>
    </svg>`,
  },
  {
    id: 'tape-red',
    category: 'doodles',
    label: 'Terracotta Tape',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" fill="none">
      <path d="M12 16l96-3-3 12 4 10-5 12-94 3 3-11-4-12 3-11z" fill="rgba(181, 61, 42, 0.82)" stroke="#161412" stroke-width="2.2"/>
    </svg>`,
  },
  {
    id: 'doodle-arrow',
    category: 'doodles',
    label: 'Doodle Arrow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <path d="M18 72c18-28 38-38 64-36" stroke="#161412" stroke-width="4" stroke-linecap="round"/>
      <path d="M68 22l16 14-16 15" stroke="#161412" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'speech-bubble',
    category: 'doodles',
    label: 'Speech Bubble',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" fill="none">
      <path d="M20 18h80c8 0 12 6 12 14v26c0 8-4 14-12 14H46L26 84l4-12H20c-8 0-12-6-12-14V32c0-8 4-14 12-14z" fill="#FFFDF9" stroke="#161412" stroke-width="3.2" stroke-linejoin="round"/>
    </svg>`,
  },

  // Text Labels
  {
    id: 'label-best-friends',
    category: 'labels',
    label: 'best friends',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 56" fill="none">
      <rect x="4" y="6" width="152" height="44" rx="22" fill="#FFFDF9" stroke="#161412" stroke-width="3"/>
      <text x="80" y="34" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="16" fill="#161412">best friends</text>
    </svg>`,
  },
  {
    id: 'label-xoxo',
    category: 'labels',
    label: 'xoxo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 56" fill="none">
      <rect x="4" y="6" width="112" height="44" rx="6" fill="#B53D2A" stroke="#161412" stroke-width="3"/>
      <text x="60" y="36" text-anchor="middle" font-family="Anton, Impact, sans-serif" letter-spacing="3" font-size="24" fill="#FFFDF9">XOXO</text>
    </svg>`,
  },
  {
    id: 'label-2026',
    category: 'labels',
    label: '2026',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 56" fill="none">
      <rect x="4" y="6" width="112" height="44" rx="22" fill="#161412"/>
      <text x="60" y="36" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="22" fill="#F6E9DC">2026</text>
    </svg>`,
  },
  {
    id: 'label-mistletoe',
    category: 'labels',
    label: 'Mistletoe Club',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 56" fill="none">
      <rect x="4" y="6" width="152" height="44" rx="4" fill="#F6E9DC" stroke="#161412" stroke-width="3"/>
      <text x="80" y="34" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="14" fill="#161412">MISTLETOE CLUB</text>
    </svg>`,
  },
];

const imageCache = new Map();

export function getStickerById(id) {
  return STICKERS.find((s) => s.id === id) || null;
}

export function loadStickerImage(id) {
  if (imageCache.has(id)) {
    return Promise.resolve(imageCache.get(id));
  }
  const sticker = getStickerById(id);
  if (!sticker) return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([sticker.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      imageCache.set(id, img);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

