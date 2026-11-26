# Mistletoe Photobooth

An analog-inspired, editorial web photobooth built with plain HTML, CSS, and vanilla JavaScript. All image capture, film emulation, sticker compositing, and strip printing happen locally in your browser—nothing is ever uploaded.

## Features

- **Flexible Strip Formats:** 1, 2, 3, 4, 6, or 8 poses in Single Strip, Double Strip, 2×2 Grid, or 2×3 Grid layouts.
- **Studio Capture Flow:** Configurable 3s / 5s / 10s countdown, front/back camera switching, mirror toggle, pause/cancel, and last-shot retake.
- **Mechanical Print Animation:** Analog printer slot reveal with optional synthesized shutter and print audio.
- **Non-Destructive Canvas Editor:**
  - **8 Film & Tone Filters:** Color, B&W, High-Contrast B&W, Sepia, Warm Film, Cool Film, Faded, Vintage Fade.
  - **Fine Adjustments:** Brightness, Contrast, Saturation, Warmth, Film Grain, Vignette, Softness/Blur, and Sharpness.
  - **Per-Photo Controls:** Select any frame on the strip to adjust its filter, zoom/crop, flip, or retake just that pose.
  - **Frame Customization:** Curated studio paper swatches + custom color, border thickness, corner radius, layout switcher, bottom caption with 3 font choices, date stamp, and studio mark.
  - **Hand-Drawn SVG Stickers, Pen & Text:** Tabbed sticker library with drag, scale, rotate, layer ordering, duplicate, freehand drawing/eraser, and custom text labels.
  - **Undo / Redo:** Full history stack (`Ctrl+Z` / `Ctrl+Shift+Z` or on-screen controls).
- **Export & Share:** High-res PNG (3×), JPG, animated buildup GIF, Clipboard copy, and Web Share API integration for mobile WhatsApp & Instagram.
- **Offline Ready:** Includes a PWA manifest and service worker for home-screen installation.

## Running Locally

> **Important:** Browser `getUserMedia` camera access requires a **secure context** (`https://` or `http://localhost` / `http://127.0.0.1`). Opening `index.html` directly via `file://` will block camera access and ES modules.

Start any static HTTP server from the project root:

```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx serve -l 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

To test on a mobile device over your local network, serve over HTTPS (e.g., via a local TLS proxy or tunnel) so `getUserMedia` and `navigator.share` are available.

## Custom Characters (`/assets/custom/`)

Drop PNG, JPG, or SVG character images into `assets/custom/` and run:

```bash
npm run build
```

This runs `scripts/build-manifest.mjs` to regenerate `assets/custom/manifest.json` automatically. All listed images appear in the **My Characters** sticker tab and can be placed as draggable, scalable, rotatable stickers or strip backgrounds.

> **Rights Notice:** You are responsible for ensuring you own or have permission/rights to use any images you add to `assets/custom/`, especially if this app is published publicly.

## Deploying / Redeploying on Vercel

```bash
npm run build && git add -A && git commit -m "Deploy update" && git push origin main
```

## Extending Themes & Sticker Packs

Themes and sticker packs are pure data objects in `js/themes.js` and `js/sticker-packs.js`. Adding a new theme or pack requires only adding one object—no renderer code changes.

### Worked Theme Example (`js/themes.js`)

```js
{
  id: 'sunset-film',
  name: 'Sunset Film',
  tagline: 'Warm amber grain & rounded corners',
  accentColor: '#C85A32',
  accentHover: '#A34422',
  packId: 'retro', // Auto-prioritized sticker pack
  background: { type: 'gradient', color: '#FCE8D5', secondary: '#F5C9A8' },
  border: { style: 'solid', color: '#C85A32', thickness: 18, radius: 8 },
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
    adjustments: { grain: 16, vignette: 14, warmth: 18 },
  },
  caption: { font: 'mono', color: '#3B2314', defaultText: 'golden hour' },
  overlay: { type: 'none', layer: 'above' },
}
```

### Worked Sticker Pack Example (`js/sticker-packs.js`)

```js
{
  id: 'my-pack',
  name: 'My Pack',
  colors: ['#B53D2A', '#161412', '#D48C46', '#3A5A40'],
  iconSvg: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5"/></svg>`,
  stickers: [
    {
      id: 'my-dot',
      label: 'Studio Dot',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="30" fill="{{C}}" stroke="#161412" stroke-width="3"/></svg>`,
    },
  ],
}
```

