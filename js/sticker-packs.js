/**
 * Pure-data Sticker Pack definitions (9 packs, 14+ hand-drawn inline SVGs each).
 * Adding a new pack requires only adding one object to STICKER_PACKS.
 * Every SVG uses `{{C}}` for its primary recolorable fill/accent so color variants work cleanly.
 */

const PALETTES = {
  classic: ['#B53D2A', '#161412', '#D48C46', '#3A5A40', '#5B7B8C'],
  y2k: ['#3A7BD5', '#C95B9C', '#7F68D6', '#9FB8D6', '#161412'],
  christmas: ['#A62626', '#2D5A3C', '#D49A2A', '#FFFDF9', '#161412'],
  kawaii: ['#E57BA0', '#9E7FD6', '#F4A261', '#70B7B7', '#161412'],
  nature: ['#587D58', '#C96A4B', '#D49A2A', '#8B5A3C', '#161412'],
  retro: ['#2A7B7B', '#D49A2A', '#B53D2A', '#161412', '#7C4D3A'],
  words: ['#161412', '#B53D2A', '#2A7B7B', '#6A3049', '#3A5A40'],
  party: ['#B53D2A', '#D49A2A', '#3A7BD5', '#C95B7A', '#3A5A40'],
  props: ['#161412', '#B53D2A', '#C95B7A', '#D49A2A', '#3A7BD5'],
};

const s = (body, sw = 3, vb = '0 0 100 100') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="none" stroke-linecap="round" stroke-linejoin="round" data-sw="${sw}">${body}</svg>`;

const badge = (text, bg = '{{C}}', fg = '#FFFDF9', rx = 20, font = 'IBM Plex Mono, monospace', fs = 16) =>
  s(`<rect x="6" y="16" width="148" height="40" rx="${rx}" fill="${bg}" stroke="#161412" stroke-width="3"/><text x="80" y="42" text-anchor="middle" font-family="${font}" font-weight="700" font-size="${fs}" fill="${fg}">${text}</text>`, 3, '0 0 160 72');

export const STICKER_PACKS = [
  {
    id: 'classics',
    name: 'Classics',
    colors: PALETTES.classic,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 13.5C4.5 10.7 2 8.2 2 5.4A3.2 3.2 0 0 1 8 3.6a3.2 3.2 0 0 1 6 1.8c0 2.8-2.5 5.3-6 8.1z"/></svg>`,
    stickers: [
      { id: 'cl-heart', label: 'Ink Heart', svg: s(`<path d="M50 83C31 68 14 53 15 35c.8-12 10-20 20-19 7 .6 12 5 15 11 3-6 9-10 16-11 10-.7 19 8 19 20 0 18-17 32-35 47z" fill="{{C}}" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'cl-heart-outline', label: 'Sketch Heart', svg: s(`<path d="M50 82C30 66 15 52 16 35c1-12 11-19 20-18 6 .7 11 5 14 10 3-5 8-9 14-10 9-1 19 6 20 18 1 17-14 31-34 47z" stroke="{{C}}" stroke-width="4.5"/>`) },
      { id: 'cl-double-heart', label: 'Double Hearts', svg: s(`<path d="M36 66C24 56 14 46 15 35c.5-8 7-13 13-12 4 .5 7 3 9 7 2-4 6-7 10-7 7 0 12 6 12 13 0 12-11 21-23 30z" fill="#F3DDD7" stroke="#161412" stroke-width="3"/><path d="M64 82C53 73 45 64 46 54c.5-7 6-11 11-10 4 .4 6 3 8 6 2-3 5-6 9-6 6 0 10 5 10 11 0 10-9 19-20 27z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'cl-star', label: 'Doodle Star', svg: s(`<path d="M51 14l10 24 25 2-19 17 6 25-22-13-22 13 6-25-19-17 25-2 10-24z" fill="{{C}}" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'cl-sparkle', label: 'Four-Point Sparkle', svg: s(`<path d="M50 10c2 26 14 38 40 40-26 2-38 14-40 40-2-26-14-38-40-40 26-2 38-14 40-40z" fill="{{C}}" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'cl-sparkle-pair', label: 'Sparkle Duo', svg: s(`<path d="M40 16c1 17 9 25 26 26-17 1-25 9-26 26-1-17-9-25-26-26 17-1 25-9 26-26z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M74 58c1 8 5 12 13 13-8 1-12 5-13 13-1-8-5-12-13-13 8-1 12-5 13-13z" fill="#FFFDF9" stroke="#161412" stroke-width="2.6"/>`) },
      { id: 'cl-arrow', label: 'Curved Arrow', svg: s(`<path d="M18 72c18-28 38-38 64-36M68 22l16 14-16 15" stroke="{{C}}" stroke-width="4.5"/>`) },
      { id: 'cl-arrow-loop', label: 'Loop Arrow', svg: s(`<path d="M16 74c24 4 38-16 28-28-9-10-22 6-10 18 14 14 40 2 50-24M72 36l14-4 4 14" stroke="{{C}}" stroke-width="4"/>`) },
      { id: 'cl-bubble', label: 'Speech Bubble', svg: s(`<path d="M20 18h80c8 0 12 6 12 14v26c0 8-4 14-12 14H46L26 84l4-12H20c-8 0-12-6-12-14V32c0-8 4-14 12-14z" fill="#FFFDF9" stroke="{{C}}" stroke-width="3.5"/>`, 3.5, '0 0 120 92') },
      { id: 'cl-thought', label: 'Thought Cloud', svg: s(`<path d="M28 58c-9 0-16-7-16-16 0-8 6-14 13-15 3-10 13-17 24-17 13 0 24 10 25 22 8 2 14 9 14 17 0 9-7 16-16 16H28z" fill="#FFFDF9" stroke="{{C}}" stroke-width="3.2"/><circle cx="28" cy="72" r="5" fill="#FFFDF9" stroke="{{C}}" stroke-width="3"/><circle cx="18" cy="83" r="3" fill="#FFFDF9" stroke="{{C}}" stroke-width="2.5"/>`) },
      { id: 'cl-tape-kraft', label: 'Masking Tape', svg: s(`<path d="M10 14l98-4-4 10 5 10-4 14-97 4 4-12-5-11 3-11z" fill="{{C}}" fill-opacity="0.82" stroke="#161412" stroke-width="2.5"/>`, 2.5, '0 0 120 60') },
      { id: 'cl-tape-diag', label: 'Striped Tape', svg: s(`<path d="M12 15h96l-4 14 4 16H12l4-16-4-14z" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/><path d="M28 15l-8 30m24-30l-8 30m24-30l-8 30m24-30l-8 30" stroke="{{C}}" stroke-width="5"/>`, 2.5, '0 0 120 60') },
      { id: 'cl-crown', label: 'Ink Crown', svg: s(`<path d="M16 74L22 30l18 18 10-24 10 24 18-18 6 44H16z" fill="{{C}}" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'cl-bow', label: 'Ribbon Bow', svg: s(`<path d="M46 48C32 32 14 27 14 42c0 14 19 16 32 8zm8 0c14-16 32-21 32-6 0 14-19 16-32 8zM46 53L31 81l11-4 6-22zm8 0l15 28-11-4-6-22z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="49" r="6" fill="#FFFDF9" stroke="#161412" stroke-width="3"/>`) },
    ],
  },
  {
    id: 'y2k',
    name: 'Y2K',
    colors: PALETTES.y2k,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2l1.4 3.6L13 7l-3.6 1.4L8 12l-1.4-3.6L3 7l3.6-1.4L8 2z"/></svg>`,
    stickers: [
      { id: 'y2k-butterfly', label: 'Butterfly', svg: s(`<path d="M48 48C30 22 12 24 16 44c3 13 18 14 32 6m4-2C70 22 88 24 84 44c-3 13-18 14-32 6M48 54c-14 4-24 18-18 28 6 9 16 2 18-24m4-4c14 4 24 18 18 28-6 9-16 2-18-24" fill="{{C}}" stroke="#161412" stroke-width="2.8"/><path d="M50 32v48" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'y2k-chrome-heart', label: 'Chrome Heart', svg: s(`<path d="M50 82C30 67 14 52 15 35c.8-12 10-20 20-19 7 .6 12 5 15 11 3-6 9-10 16-11 10-.7 19 8 19 20 0 18-17 32-35 46z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M27 32c3-7 9-10 14-8" stroke="#FFFDF9" stroke-width="3.5"/>`) },
      { id: 'y2k-pixel-star', label: 'Pixel Star', svg: s(`<path d="M44 14h12v18h18v12h12v12H74v18H56v12H44V74H26V56H14V44h12V32h18V14z" fill="{{C}}" stroke="#161412" stroke-width="2.8"/>`) },
      { id: 'y2k-flip-phone', label: 'Flip Phone', svg: s(`<rect x="30" y="14" width="40" height="34" rx="6" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="36" y="20" width="28" height="22" rx="2" fill="#DCEEFF" stroke="#161412" stroke-width="2"/><rect x="30" y="50" width="40" height="36" rx="6" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><path d="M38 60h24M38 68h24M38 76h24" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'y2k-cherries', label: 'Cherries', svg: s(`<path d="M34 62c4-22 14-34 26-44M66 64c-2-18-4-32-6-46" stroke="#3A5A40" stroke-width="3.2"/><circle cx="32" cy="68" r="14" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="66" cy="70" r="14" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="27" cy="63" r="3" fill="#FFFDF9"/>`) },
      { id: 'y2k-lightning', label: 'Lightning Bolt', svg: s(`<path d="M56 12L26 54h20L38 88l36-46H52l4-30z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'y2k-angel', label: 'angel', svg: badge('ANGEL', '{{C}}', '#FFFDF9', 20, 'Anton, sans-serif', 20) },
      { id: 'y2k-itgirl', label: 'it girl', svg: badge('IT GIRL', '{{C}}', '#FFFDF9', 6, 'IBM Plex Mono, monospace', 17) },
      { id: 'y2k-smiley', label: 'Star-Eyes Smiley', svg: s(`<circle cx="50" cy="50" r="36" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M35 38l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6zm30 0l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z" fill="#FFFDF9" stroke="#161412" stroke-width="1.8"/><path d="M34 64c6 8 26 8 32 0" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'y2k-cd', label: 'CD Disc', svg: s(`<circle cx="50" cy="50" r="36" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="50" r="10" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><path d="M26 30l16 14m16 12l16 14" stroke="#FFFDF9" stroke-width="3"/>`) },
      { id: 'y2k-orbit', label: 'Cyber Orbit', svg: s(`<circle cx="50" cy="50" r="16" fill="{{C}}" stroke="#161412" stroke-width="3"/><ellipse cx="50" cy="50" rx="40" ry="14" transform="rotate(-24 50 50)" stroke="#161412" stroke-width="3"/>`) },
      { id: 'y2k-wings', label: 'Angel Wings', svg: s(`<path d="M46 54C26 24 10 28 14 48c4 14 18 16 32 6zm8 0c20-30 36-26 32-6-4 14-18 16-32 6z" fill="#FFFDF9" stroke="{{C}}" stroke-width="3.5"/>`) },
      { id: 'y2k-flame', label: 'Hot Flame', svg: s(`<path d="M52 14c8 16 24 26 24 46 0 15-12 26-26 26S24 75 24 60c0-12 8-22 14-28 0 10 6 14 10 14-4-12 0-24 4-32z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'y2k-2000', label: '2026 cyber', svg: badge('2026', '#161412', '{{C}}', 20, 'IBM Plex Mono, monospace', 19) },
    ],
  },
  {
    id: 'christmas',
    name: 'Christmas',
    colors: PALETTES.christmas,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2v12M2 8h12M3.8 3.8l8.4 8.4M12.2 3.8l-8.4 8.4"/></svg>`,
    stickers: [
      { id: 'xmas-mistletoe', label: 'Mistletoe', svg: s(`<path d="M50 14v32m0 0c-12 6-23 16-28 28m28-28c11 8 21 18 26 30" stroke="#161412" stroke-width="3"/><ellipse cx="29" cy="54" rx="14" ry="7" transform="rotate(-28 29 54)" fill="#2D5A3C" stroke="#161412" stroke-width="2.8"/><ellipse cx="70" cy="54" rx="14" ry="7" transform="rotate(28 70 54)" fill="#2D5A3C" stroke="#161412" stroke-width="2.8"/><circle cx="44" cy="55" r="6" fill="{{C}}" stroke="#161412" stroke-width="2.5"/><circle cx="56" cy="57" r="6" fill="{{C}}" stroke="#161412" stroke-width="2.5"/><circle cx="50" cy="65" r="6" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'xmas-candy-cane', label: 'Candy Cane', svg: s(`<path d="M62 36c0-12-24-12-24 0v48" stroke="#FFFDF9" stroke-width="14"/><path d="M62 36c0-12-24-12-24 0v48" stroke="{{C}}" stroke-width="14" stroke-dasharray="10 10"/><path d="M62 36c0-12-24-12-24 0v48" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'xmas-stocking', label: 'Stocking', svg: s(`<path d="M36 22h28v34c0 12 14 14 14 24 0 8-8 12-18 12-16 0-24-10-24-22V22z" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="32" y="16" width="36" height="12" rx="4" fill="#FFFDF9" stroke="#161412" stroke-width="3"/>`) },
      { id: 'xmas-ornament', label: 'Ornament', svg: s(`<rect x="44" y="16" width="12" height="10" rx="2" fill="#D49A2A" stroke="#161412" stroke-width="2.8"/><circle cx="50" cy="56" r="28" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M26 52h48M28 64h44" stroke="#FFFDF9" stroke-width="3"/>`) },
      { id: 'xmas-antlers', label: 'Reindeer Antlers', svg: s(`<path d="M34 78C26 58 20 42 18 22m8 28L12 40m16-4l8-14M66 78c8-20 14-36 16-56m-8 28l14-10M72 36l-8-14" stroke="{{C}}" stroke-width="5"/>`) },
      { id: 'xmas-santa-hat', label: 'Santa Hat', svg: s(`<path d="M20 68c8-30 22-48 44-46 12 1 18 12 12 22l-4 24H20z" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="16" y="64" width="62" height="16" rx="8" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><circle cx="78" cy="30" r="8" fill="#FFFDF9" stroke="#161412" stroke-width="3"/>`) },
      { id: 'xmas-snowflake', label: 'Snowflake', svg: s(`<path d="M50 12v76M12 50h76M23 23l54 54M77 23L23 77M42 20l8 8 8-8M42 80l8-8 8 8M20 42l8 8-8 8M80 42l-8 8 8 8" stroke="{{C}}" stroke-width="3.5"/>`) },
      { id: 'xmas-gift', label: 'Gift Box', svg: s(`<rect x="20" y="34" width="60" height="50" rx="4" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="16" y="28" width="68" height="14" rx="3" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M50 28v56M20 56h60" stroke="#FFFDF9" stroke-width="6"/><path d="M50 28c-10-12-20-8-14 0m14 0c10-12 20-8 14 0" stroke="#161412" stroke-width="3"/>`) },
      { id: 'xmas-hohoho', label: 'ho ho ho', svg: badge('HO HO HO', '{{C}}', '#FFFDF9', 20, 'Anton, sans-serif', 19) },
      { id: 'xmas-holly', label: 'Holly & Berries', svg: s(`<path d="M22 48c8-18 24-22 32-12-8 14-20 20-32 12zm56 0c-8-18-24-22-32-12 8 14 20 20 32 12z" fill="#2D5A3C" stroke="#161412" stroke-width="3"/><circle cx="45" cy="56" r="7" fill="{{C}}" stroke="#161412" stroke-width="2.5"/><circle cx="57" cy="57" r="7" fill="{{C}}" stroke="#161412" stroke-width="2.5"/><circle cx="50" cy="46" r="7" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'xmas-tree', label: 'Pine Tree', svg: s(`<path d="M50 14L24 44h16L20 68h60L60 44h16L50 14z" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="44" y="68" width="12" height="16" fill="#7C4D3A" stroke="#161412" stroke-width="3"/>`) },
      { id: 'xmas-bell', label: 'Jingle Bell', svg: s(`<path d="M30 64c0-20 8-34 20-34s20 14 20 34l8 10H22l8-10z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="78" r="6" fill="#161412"/>`) },
      { id: 'xmas-cookie', label: 'Gingerbread', svg: s(`<circle cx="50" cy="28" r="12" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M24 46h52l-10 14 8 24H56l-6-14-6 14H26l8-24-10-14z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'xmas-merry', label: 'Merry & Bright', svg: badge('MERRY & BRIGHT', '#2D5A3C', '#FFFDF9', 6, 'IBM Plex Mono, monospace', 13) },
    ],
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    colors: PALETTES.kawaii,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><circle cx="6" cy="7" r=".7" fill="currentColor"/><circle cx="10" cy="7" r=".7" fill="currentColor"/><path d="M6 10c1 1.2 3 1.2 4 0"/></svg>`,
    stickers: [
      { id: 'kw-blush-face', label: 'Blushing Face', svg: s(`<circle cx="50" cy="50" r="36" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><circle cx="36" cy="46" r="3.5" fill="#161412"/><circle cx="64" cy="46" r="3.5" fill="#161412"/><ellipse cx="28" cy="54" rx="6" ry="3.5" fill="{{C}}"/><ellipse cx="72" cy="54" rx="6" ry="3.5" fill="{{C}}"/><path d="M44 55c3 4 9 4 12 0" stroke="#161412" stroke-width="3"/>`) },
      { id: 'kw-cloud', label: 'Happy Cloud', svg: s(`<path d="M26 68c-9 0-16-7-16-16 0-8 6-15 14-16 4-10 14-17 26-17 14 0 25 11 26 24 8 2 14 9 14 17 0 9-7 16-16 16H26z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="42" cy="50" r="2.5" fill="#161412"/><circle cx="58" cy="50" r="2.5" fill="#161412"/>`) },
      { id: 'kw-bunny', label: 'Bunny', svg: s(`<ellipse cx="38" cy="28" rx="7" ry="18" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><ellipse cx="62" cy="28" rx="7" ry="18" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><circle cx="50" cy="60" r="24" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><circle cx="42" cy="58" r="2.5" fill="#161412"/><circle cx="58" cy="58" r="2.5" fill="#161412"/><ellipse cx="34" cy="64" rx="5" ry="3" fill="{{C}}"/><ellipse cx="66" cy="64" rx="5" ry="3" fill="{{C}}"/>`) },
      { id: 'kw-bear', label: 'Bear', svg: s(`<circle cx="28" cy="34" r="10" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="72" cy="34" r="10" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="56" r="26" fill="{{C}}" stroke="#161412" stroke-width="3"/><ellipse cx="50" cy="62" rx="10" ry="7" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/><circle cx="40" cy="52" r="2.5" fill="#161412"/><circle cx="60" cy="52" r="2.5" fill="#161412"/>`) },
      { id: 'kw-strawberry', label: 'Strawberry', svg: s(`<path d="M50 84C32 80 22 58 26 40c4-14 44-14 48 0 4 18-6 40-24 44z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M36 32l14 8 14-8-14-12-14 12z" fill="#587D58" stroke="#161412" stroke-width="2.5"/><circle cx="42" cy="52" r="2" fill="#FFFDF9"/><circle cx="58" cy="54" r="2" fill="#FFFDF9"/><circle cx="50" cy="66" r="2" fill="#FFFDF9"/>`) },
      { id: 'kw-boba', label: 'Boba Cup', svg: s(`<path d="M30 34h40l-6 50H36l-6-50z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M26 34h48M56 14l-4 20" stroke="#161412" stroke-width="3.5"/><circle cx="42" cy="74" r="4" fill="#161412"/><circle cx="52" cy="76" r="4" fill="#161412"/><circle cx="58" cy="70" r="4" fill="#161412"/>`) },
      { id: 'kw-crown', label: 'Tiny Crown', svg: s(`<path d="M20 70l6-34 16 14 8-22 8 22 16-14 6 34H20z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="24" r="4" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'kw-rainbow', label: 'Rainbow', svg: s(`<path d="M16 74a34 34 0 0 1 68 0" stroke="{{C}}" stroke-width="10"/><path d="M26 74a24 24 0 0 1 48 0" stroke="#F4A261" stroke-width="8"/><path d="M36 74a14 14 0 0 1 28 0" stroke="#70B7B7" stroke-width="6"/>`) },
      { id: 'kw-sparkly-heart', label: 'Sparkly Heart', svg: s(`<path d="M50 82C30 67 16 52 17 36c.8-12 10-19 19-18 6 .6 11 5 14 10 3-5 8-9 14-10 9-.7 18 7 19 19 1 16-14 30-33 45z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M74 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="#FFFDF9" stroke="#161412" stroke-width="2"/>`) },
      { id: 'kw-cat', label: 'Kitty Head', svg: s(`<path d="M24 44l6-22 14 12h12l14-12 6 22c4 18-8 36-26 36S20 62 24 44z" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><circle cx="40" cy="52" r="2.8" fill="#161412"/><circle cx="60" cy="52" r="2.8" fill="#161412"/><ellipse cx="50" cy="58" rx="4" ry="2.5" fill="{{C}}"/>`) },
      { id: 'kw-peach', label: 'Sweet Peach', svg: s(`<path d="M50 82c-20-6-28-24-24-40 4-14 18-16 24-8 6-8 20-6 24 8 4 16-4 34-24 40z" fill="{{C}}" stroke="#161412" stroke-width="3"/><ellipse cx="58" cy="24" rx="10" ry="5" transform="rotate(-25 58 24)" fill="#587D58" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'kw-star-wand', label: 'Star Wand', svg: s(`<path d="M24 80l36-36" stroke="#161412" stroke-width="4"/><path d="M64 16l5 13 14 1-11 9 3 14-11-7-11 7 3-14-11-9 14-1 5-13z" fill="{{C}}" stroke="#161412" stroke-width="2.8"/>`) },
      { id: 'kw-ribbon', label: 'Soft Bow', svg: s(`<path d="M46 48C32 32 14 27 14 42c0 14 19 16 32 8zm8 0c14-16 32-21 32-6 0 14-19 16-32 8z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="49" r="6" fill="#FFFDF9" stroke="#161412" stroke-width="3"/>`) },
      { id: 'kw-uwu', label: 'uwu', svg: badge('SO CUTE', '{{C}}', '#FFFDF9', 20, 'DM Sans, sans-serif', 16) },
    ],
  },
  {
    id: 'nature',
    name: 'Flowers & Nature',
    colors: PALETTES.nature,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2.2"/><path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M4.1 4.1l1.4 1.4M10.5 10.5l1.4 1.4M11.9 4.1l-1.4 1.4M5.5 10.5l-1.4 1.4"/></svg>`,
    stickers: [
      { id: 'nat-daisy', label: 'Wild Daisy', svg: s(`<g fill="#FFFDF9" stroke="#161412" stroke-width="2.8"><ellipse cx="50" cy="24" rx="8" ry="14"/><ellipse cx="50" cy="76" rx="8" ry="14"/><ellipse cx="24" cy="50" rx="14" ry="8"/><ellipse cx="76" cy="50" rx="14" ry="8"/><ellipse cx="31" cy="31" rx="8" ry="13" transform="rotate(-45 31 31)"/><ellipse cx="69" cy="69" rx="8" ry="13" transform="rotate(-45 69 69)"/></g><circle cx="50" cy="50" r="11" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'nat-rose', label: 'Rose', svg: s(`<path d="M50 56v30" stroke="#3A5A40" stroke-width="4"/><circle cx="50" cy="38" r="20" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M40 38c0-6 12-10 16-2 4 8-12 14-18 4" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'nat-tulip', label: 'Tulip', svg: s(`<path d="M50 54v32" stroke="#3A5A40" stroke-width="4"/><path d="M30 26l10 10 10-14 10 14 10-10c4 18-4 32-20 32S26 44 30 26z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'nat-leaf', label: 'Pressed Leaf', svg: s(`<path d="M22 82C34 58 52 38 78 18" stroke="#161412" stroke-width="3"/><ellipse cx="44" cy="50" rx="12" ry="6" transform="rotate(-55 44 50)" fill="{{C}}" stroke="#161412" stroke-width="2.5"/><ellipse cx="62" cy="56" rx="12" ry="6" transform="rotate(15 62 56)" fill="{{C}}" stroke="#161412" stroke-width="2.5"/><ellipse cx="64" cy="32" rx="11" ry="5.5" transform="rotate(-40 64 32)" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'nat-sakura', label: 'Cherry Blossom', svg: s(`<g fill="{{C}}" stroke="#161412" stroke-width="2.5"><circle cx="50" cy="26" r="12"/><circle cx="72" cy="44" r="12"/><circle cx="64" cy="70" r="12"/><circle cx="36" cy="70" r="12"/><circle cx="28" cy="44" r="12"/></g><circle cx="50" cy="50" r="8" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'nat-moon', label: 'Crescent Moon', svg: s(`<path d="M62 18c-20 4-32 24-27 45 4 16 18 26 34 25-14-5-21-19-18-35 3-14 12-26 24-31-4-3-8-4-13-4z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'nat-sun', label: 'Sunburst', svg: s(`<circle cx="50" cy="50" r="18" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M50 14v10M50 76v10M14 50h10M76 50h10M24 24l8 8M68 68l8 8M76 24l-8 8M32 68l-8 8" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'nat-mushroom', label: 'Mushroom', svg: s(`<path d="M40 52h20l4 30H36l4-30z" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><path d="M20 52c0-20 14-32 30-32s30 12 30 32H20z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="40" cy="36" r="4" fill="#FFFDF9"/><circle cx="60" cy="40" r="5" fill="#FFFDF9"/>`) },
      { id: 'nat-fern', label: 'Fern Sprig', svg: s(`<path d="M50 86V16M50 70l-18-10M50 56l20-10M50 44l-16-10M50 32l14-8" stroke="{{C}}" stroke-width="4"/>`) },
      { id: 'nat-clover', label: 'Four-Leaf Clover', svg: s(`<g fill="{{C}}" stroke="#161412" stroke-width="2.8"><circle cx="38" cy="38" r="14"/><circle cx="62" cy="38" r="14"/><circle cx="38" cy="62" r="14"/><circle cx="62" cy="62" r="14"/></g><path d="M50 62c0 14 4 22 10 26" stroke="#161412" stroke-width="3"/>`) },
      { id: 'nat-bee', label: 'Honeybee', svg: s(`<ellipse cx="38" cy="34" rx="10" ry="14" transform="rotate(-25 38 34)" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/><ellipse cx="62" cy="34" rx="10" ry="14" transform="rotate(25 62 34)" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/><ellipse cx="50" cy="56" rx="18" ry="12" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M44 45v22M56 45v22" stroke="#161412" stroke-width="3"/>`) },
      { id: 'nat-sprout', label: 'Sprout', svg: s(`<path d="M50 82V42" stroke="#161412" stroke-width="3.5"/><ellipse cx="36" cy="38" rx="14" ry="8" transform="rotate(-25 36 38)" fill="{{C}}" stroke="#161412" stroke-width="2.8"/><ellipse cx="64" cy="38" rx="14" ry="8" transform="rotate(25 64 38)" fill="{{C}}" stroke="#161412" stroke-width="2.8"/>`) },
      { id: 'nat-acorn', label: 'Acorn', svg: s(`<path d="M30 44h40c0 22-8 34-20 38-12-4-20-16-20-38z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M24 44c0-14 12-20 26-20s26 6 26 20H24z" fill="#7C4D3A" stroke="#161412" stroke-width="3"/>`) },
      { id: 'nat-sunflower', label: 'Sunflower', svg: s(`<circle cx="50" cy="50" r="28" fill="{{C}}" stroke="#161412" stroke-width="3" stroke-dasharray="10 5"/><circle cx="50" cy="50" r="14" fill="#5C3A21" stroke="#161412" stroke-width="3"/>`) },
    ],
  },
  {
    id: 'retro',
    name: 'Retro & Film',
    colors: PALETTES.retro,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="12" height="9" rx="1.5"/><circle cx="8" cy="8.5" r="2.2"/></svg>`,
    stickers: [
      { id: 'ret-camera', label: 'Analog Camera', svg: s(`<rect x="16" y="30" width="68" height="48" rx="6" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="36" y="20" width="28" height="10" rx="2" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><circle cx="50" cy="54" r="14" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><circle cx="50" cy="54" r="6" fill="#161412"/>`) },
      { id: 'ret-reel', label: 'Film Reel', svg: s(`<circle cx="50" cy="50" r="34" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="50" r="8" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/><circle cx="50" cy="28" r="6" fill="#FFFDF9"/><circle cx="50" cy="72" r="6" fill="#FFFDF9"/><circle cx="28" cy="50" r="6" fill="#FFFDF9"/><circle cx="72" cy="50" r="6" fill="#FFFDF9"/>`) },
      { id: 'ret-cassette', label: 'Cassette', svg: s(`<rect x="12" y="26" width="76" height="48" rx="4" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="24" y="34" width="52" height="22" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/><circle cx="36" cy="45" r="6" fill="#161412"/><circle cx="64" cy="45" r="6" fill="#161412"/>`) },
      { id: 'ret-vinyl', label: 'Vinyl Record', svg: s(`<circle cx="50" cy="50" r="36" fill="#161412"/><circle cx="50" cy="50" r="26" stroke="#5C544D" stroke-width="1.5"/><circle cx="50" cy="50" r="14" fill="{{C}}" stroke="#FFFDF9" stroke-width="2"/><circle cx="50" cy="50" r="4" fill="#161412"/>`) },
      { id: 'ret-starburst', label: 'Starburst', svg: s(`<path d="M50 10l8 24 24-10-10 24 24 8-24 8 10 24-24-10-8 24-8-24-24 10 10-24-24-8 24-8-10-24 24 10 8-24z" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'ret-admit', label: 'ADMIT ONE', svg: badge('ADMIT ONE', '{{C}}', '#FFFDF9', 4, 'IBM Plex Mono, monospace', 16) },
      { id: 'ret-live', label: 'LIVE Badge', svg: badge('● LIVE', '#B53D2A', '#FFFDF9', 6, 'IBM Plex Mono, monospace', 17) },
      { id: 'ret-polaroid', label: 'Mini Polaroid', svg: s(`<rect x="22" y="14" width="56" height="72" rx="3" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><rect x="28" y="20" width="44" height="44" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'ret-clapboard', label: 'Slate', svg: s(`<rect x="18" y="34" width="64" height="46" fill="#161412" stroke="#161412" stroke-width="3"/><path d="M18 34l64-12v12H18z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'ret-tv', label: 'Retro TV', svg: s(`<path d="M36 14l14 14 14-14" stroke="#161412" stroke-width="3"/><rect x="16" y="28" width="68" height="52" rx="10" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="24" y="36" width="40" height="36" rx="6" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'ret-mic', label: 'Studio Mic', svg: s(`<rect x="38" y="18" width="24" height="38" rx="12" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M28 46c0 14 10 22 22 22s22-8 22-22M50 68v16M36 84h28" stroke="#161412" stroke-width="3.2"/>`) },
      { id: 'ret-flash', label: 'Flash Bulb', svg: s(`<circle cx="50" cy="42" r="22" fill="{{C}}" stroke="#161412" stroke-width="3"/><rect x="40" y="64" width="20" height="16" rx="2" fill="#FFFDF9" stroke="#161412" stroke-width="3"/>`) },
      { id: 'ret-35mm', label: '35MM', svg: badge('35MM FILM', '#161412', '#F6E9DC', 4, 'IBM Plex Mono, monospace', 16) },
      { id: 'ret-rec', label: 'REC', svg: badge('REC 00:04', '{{C}}', '#FFFDF9', 20, 'IBM Plex Mono, monospace', 15) },
    ],
  },
  {
    id: 'words',
    name: 'Words',
    colors: PALETTES.words,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h10M8 4v8.5M5.5 12.5h5"/></svg>`,
    stickers: [
      { id: 'wd-best-friends', label: 'best friends', svg: badge('best friends', '#FFFDF9', '{{C}}', 20, 'IBM Plex Mono, monospace', 15) },
      { id: 'wd-xoxo', label: 'xoxo', svg: badge('XOXO', '{{C}}', '#FFFDF9', 6, 'Anton, sans-serif', 22) },
      { id: 'wd-besties', label: 'besties', svg: badge('BESTIES', '{{C}}', '#FFFDF9', 20, 'DM Sans, sans-serif', 18) },
      { id: 'wd-us', label: 'us', svg: badge('us.', '#161412', '#F6E9DC', 20, 'DM Sans, sans-serif', 20) },
      { id: 'wd-core-memory', label: 'core memory', svg: badge('CORE MEMORY', '{{C}}', '#FFFDF9', 4, 'IBM Plex Mono, monospace', 15) },
      { id: 'wd-love-you', label: 'love you', svg: badge('love you!', '#F3DDD7', '{{C}}', 20, 'DM Sans, sans-serif', 17) },
      { id: 'wd-2026', label: '2026', svg: badge('2026', '{{C}}', '#FFFDF9', 20, 'IBM Plex Mono, monospace', 20) },
      { id: 'wd-good-times', label: 'good times', svg: badge('GOOD TIMES', '#FFFDF9', '{{C}}', 4, 'Anton, sans-serif', 19) },
      { id: 'wd-thats-so-us', label: "that's so us", svg: badge("THAT'S SO US", '{{C}}', '#FFFDF9', 14, 'IBM Plex Mono, monospace', 14) },
      { id: 'wd-mistletoe', label: 'mistletoe club', svg: badge('MISTLETOE CLUB', '#F6E9DC', '{{C}}', 4, 'IBM Plex Mono, monospace', 13) },
      { id: 'wd-main-char', label: 'main character', svg: badge('MAIN CHARACTER', '#161412', '{{C}}', 20, 'IBM Plex Mono, monospace', 13) },
      { id: 'wd-no-filter', label: 'no filter', svg: badge('NO FILTER', '{{C}}', '#FFFDF9', 4, 'IBM Plex Mono, monospace', 16) },
      { id: 'wd-say-cheese', label: 'say cheese', svg: badge('SAY CHEESE!', '#FFFDF9', '{{C}}', 20, 'Anton, sans-serif', 18) },
      { id: 'wd-forever', label: 'forever', svg: badge('FOREVER', '{{C}}', '#FFFDF9', 20, 'DM Sans, sans-serif', 17) },
    ],
  },
  {
    id: 'party',
    name: 'Party & Birthday',
    colors: PALETTES.party,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 13L7 3l6 6-10 4zM9.5 4.5l2-2"/></svg>`,
    stickers: [
      { id: 'pty-balloon', label: 'Balloon', svg: s(`<ellipse cx="50" cy="38" rx="22" ry="26" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M50 64l-4 6h8l-4-6zm0 6c-4 8 6 12 0 20" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'pty-balloons', label: 'Balloon Bunch', svg: s(`<ellipse cx="36" cy="40" rx="16" ry="20" fill="{{C}}" stroke="#161412" stroke-width="2.8"/><ellipse cx="64" cy="36" rx="16" ry="20" fill="#D49A2A" stroke="#161412" stroke-width="2.8"/><path d="M36 60l14 26m14-30L50 86" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'pty-confetti', label: 'Confetti Pop', svg: s(`<path d="M22 78L42 32l26 26-46 20z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="68" cy="22" r="4" fill="#D49A2A"/><circle cx="80" cy="38" r="4" fill="#3A7BD5"/><path d="M52 18l6-6m20 14l8-2" stroke="#161412" stroke-width="3"/>`) },
      { id: 'pty-cake', label: 'Birthday Cake', svg: s(`<rect x="22" y="48" width="56" height="32" rx="4" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M22 60c8 6 14 0 18 0s10 6 20 0 12 6 18 0" stroke="#FFFDF9" stroke-width="4"/><path d="M50 26v22" stroke="#161412" stroke-width="4"/><circle cx="50" cy="20" r="5" fill="#D49A2A" stroke="#161412" stroke-width="2"/>`) },
      { id: 'pty-hat', label: 'Party Hat', svg: s(`<path d="M50 16L22 78h56L50 16z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="14" r="7" fill="#FFFDF9" stroke="#161412" stroke-width="2.8"/><path d="M36 48h28M28 64h44" stroke="#FFFDF9" stroke-width="3"/>`) },
      { id: 'pty-sparkler', label: 'Sparkler', svg: s(`<path d="M22 82l34-34" stroke="#161412" stroke-width="4"/><path d="M62 18v12m0 24v12M38 42h12m24 0h12M46 26l8 8M70 50l8 8M78 26l-8 8M54 50l-8 8" stroke="{{C}}" stroke-width="3.2"/>`) },
      { id: 'pty-hbd', label: 'happy birthday', svg: badge('HAPPY BIRTHDAY', '{{C}}', '#FFFDF9', 20, 'IBM Plex Mono, monospace', 13) },
      { id: 'pty-streamers', label: 'Streamers', svg: s(`<path d="M18 22c16 14-8 28 10 42s-6 20 8 24M52 16c14 14-10 26 8 40s-8 22 6 28M80 22c-12 16 10 26-8 42" stroke="{{C}}" stroke-width="4.5"/>`) },
      { id: 'pty-cupcake', label: 'Cupcake', svg: s(`<path d="M28 52h44l-6 28H34l-6-28z" fill="#D49A2A" stroke="#161412" stroke-width="3"/><path d="M24 52c0-14 12-22 26-22s26 8 26 22H24z" fill="{{C}}" stroke="#161412" stroke-width="3"/><circle cx="50" cy="24" r="6" fill="#B53D2A" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'pty-cheers', label: 'Cheers Glasses', svg: s(`<path d="M22 24h20l-2 22c0 8-16 8-16 0l-2-22zm36 0h20l-2 22c0 8-16 8-16 0l-2-22z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M32 52v26M68 52v26M24 78h16M60 78h16" stroke="#161412" stroke-width="3"/>`) },
      { id: 'pty-disco', label: 'Disco Ball', svg: s(`<path d="M50 10v14" stroke="#161412" stroke-width="3"/><circle cx="50" cy="54" r="30" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M22 44h56M22 64h56M50 24v60" stroke="#FFFDF9" stroke-width="2"/>`) },
      { id: 'pty-candle', label: 'Candle', svg: s(`<rect x="40" y="38" width="20" height="44" rx="3" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M50 14c8 10 8 18 0 22-8-4-8-12 0-22z" fill="#D49A2A" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'pty-makeawish', label: 'make a wish', svg: badge('MAKE A WISH', '#161412', '{{C}}', 20, 'IBM Plex Mono, monospace', 15) },
      { id: 'pty-celebrate', label: 'celebrate', svg: badge('CELEBRATE!', '{{C}}', '#FFFDF9', 6, 'Anton, sans-serif', 19) },
    ],
  },
  {
    id: 'face-props',
    name: 'Face Props',
    colors: PALETTES.props,
    iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="6" width="5" height="4" rx="1"/><rect x="9.5" y="6" width="5" height="4" rx="1"/><path d="M6.5 8h3"/></svg>`,
    stickers: [
      { id: 'fp-sunglasses', label: 'Sunglasses', isFaceProp: 'eyes', svg: s(`<rect x="10" y="34" width="34" height="26" rx="6" fill="{{C}}" stroke="#161412" stroke-width="3.2"/><rect x="56" y="34" width="34" height="26" rx="6" fill="{{C}}" stroke="#161412" stroke-width="3.2"/><path d="M44 42h12" stroke="#161412" stroke-width="4"/>`) },
      { id: 'fp-heart-glasses', label: 'Heart Glasses', isFaceProp: 'eyes', svg: s(`<path d="M28 60C14 50 8 38 14 30c5-6 12-2 14 4 2-6 9-10 14-4 6 8 0 20-14 30zm44 0C58 50 52 38 58 30c5-6 12-2 14 4 2-6 9-10 14-4 6 8 0 20-14 30z" fill="{{C}}" stroke="#161412" stroke-width="3"/><path d="M44 40h12" stroke="#161412" stroke-width="3.5"/>`) },
      { id: 'fp-round-glasses', label: 'Round Specs', isFaceProp: 'eyes', svg: s(`<circle cx="30" cy="50" r="16" fill="#FFFDF9" fill-opacity="0.3" stroke="{{C}}" stroke-width="4"/><circle cx="70" cy="50" r="16" fill="#FFFDF9" fill-opacity="0.3" stroke="{{C}}" stroke-width="4"/><path d="M46 50h8" stroke="{{C}}" stroke-width="4"/>`) },
      { id: 'fp-mustache', label: 'Mustache', isFaceProp: 'mouth', svg: s(`<path d="M50 48c-8-10-22-8-34 6 10 8 24 6 34-2 10 8 24 10 34 2-12-14-26-16-34-6z" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'fp-bunny-ears', label: 'Bunny Ears', isFaceProp: 'head', svg: s(`<ellipse cx="34" cy="48" rx="11" ry="34" transform="rotate(-8 34 48)" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><ellipse cx="34" cy="50" rx="5" ry="22" transform="rotate(-8 34 50)" fill="{{C}}"/><ellipse cx="66" cy="48" rx="11" ry="34" transform="rotate(8 66 48)" fill="#FFFDF9" stroke="#161412" stroke-width="3"/><ellipse cx="66" cy="50" rx="5" ry="22" transform="rotate(8 66 50)" fill="{{C}}"/>`) },
      { id: 'fp-cat-ears', label: 'Cat Ears', isFaceProp: 'head', svg: s(`<path d="M16 74L28 24l18 32H16zm38-18l18-32 12 50H54z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'fp-halo', label: 'Halo', isFaceProp: 'head', svg: s(`<ellipse cx="50" cy="50" rx="34" ry="12" stroke="{{C}}" stroke-width="7"/><ellipse cx="50" cy="50" rx="34" ry="12" stroke="#161412" stroke-width="2"/>`) },
      { id: 'fp-flower-crown', label: 'Flower Crown', isFaceProp: 'head', svg: s(`<path d="M14 58c24-12 48-12 72 0" stroke="#3A5A40" stroke-width="5"/><circle cx="24" cy="52" r="9" fill="{{C}}" stroke="#161412" stroke-width="2.5"/><circle cx="50" cy="44" r="10" fill="#FFFDF9" stroke="#161412" stroke-width="2.5"/><circle cx="76" cy="52" r="9" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'fp-blush', label: 'Blush Marks', isFaceProp: 'cheeks', svg: s(`<ellipse cx="22" cy="50" rx="12" ry="7" fill="{{C}}" fill-opacity="0.7"/><ellipse cx="78" cy="50" rx="12" ry="7" fill="{{C}}" fill-opacity="0.7"/><path d="M18 48l4 4m4-4l4 4M70 48l4 4m4-4l4 4" stroke="#FFFDF9" stroke-width="2"/>`) },
      { id: 'fp-freckles', label: 'Freckles', isFaceProp: 'cheeks', svg: s(`<g fill="{{C}}"><circle cx="20" cy="46" r="2.5"/><circle cx="28" cy="52" r="2.5"/><circle cx="18" cy="56" r="2.5"/><circle cx="72" cy="52" r="2.5"/><circle cx="80" cy="46" r="2.5"/><circle cx="82" cy="56" r="2.5"/></g>`) },
      { id: 'fp-devil-horns', label: 'Devil Horns', isFaceProp: 'head', svg: s(`<path d="M22 68c-4-22 2-38 14-44-2 16 2 28 8 36l-22 8zm56 0c4-22-2-38-14-44 2 16-2 28-8 36l22 8z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'fp-tiara', label: 'Tiara', isFaceProp: 'head', svg: s(`<path d="M18 66l12-26 12 14 8-28 8 28 12-14 12 26H18z" fill="{{C}}" stroke="#161412" stroke-width="3"/>`) },
      { id: 'fp-star-shades', label: 'Star Shades', isFaceProp: 'eyes', svg: s(`<path d="M28 24l6 14 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2 6-14zm44 0l6 14 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2 6-14z" fill="{{C}}" stroke="#161412" stroke-width="2.5"/>`) },
      { id: 'fp-lips', label: 'Lipstick Kiss', isFaceProp: 'mouth', svg: s(`<path d="M16 50c12-14 24-12 34-4 10-8 22-10 34 4-10 16-24 22-34 22S26 66 16 50z" fill="{{C}}" stroke="#161412" stroke-width="2.8"/>`) },
    ],
  },
];

export const ALL_STICKERS = STICKER_PACKS.flatMap((pack) =>
  pack.stickers.map((st) => ({
    ...st,
    packId: pack.id,
    colors: pack.colors,
  }))
);

export function getPackById(id) {
  return STICKER_PACKS.find((p) => p.id === id) || STICKER_PACKS[0];
}

export function getStickerDef(id) {
  return ALL_STICKERS.find((s) => s.id === id) || null;
}

export function renderStickerSvg(stickerId, colorOverride = null) {
  const def = getStickerDef(stickerId);
  if (!def) return '';
  const color = colorOverride || def.colors[0] || '#B53D2A';
  return def.svg.replaceAll('{{C}}', color);
}
