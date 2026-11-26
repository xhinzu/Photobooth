/**
 * Reusable SVG Fairy Lights system + Bokeh background orbs.
 * Modes: 'twinkle' (default), 'chase', 'alternate', 'steady'.
 * Persists on/off and mode in localStorage.
 * Caps total bulbs on mobile (~40) and respects prefers-reduced-motion.
 */

const LIGHTS_ENABLED_KEY = 'mistletoe_lights_enabled';
const LIGHTS_MODE_KEY = 'mistletoe_lights_mode';
const BULB_COLORS = ['#E8283A', '#17A35A', '#FFC83D', '#4CC9F0', '#FF4FA3', '#FFF4E0'];
export const LIGHT_MODES = ['twinkle', 'chase', 'alternate', 'steady'];

let lightsEnabled = true;
let lightsMode = 'twinkle';

try {
  const savedOn = localStorage.getItem(LIGHTS_ENABLED_KEY);
  if (savedOn !== null) lightsEnabled = savedOn === 'true';
  const savedMode = localStorage.getItem(LIGHTS_MODE_KEY);
  if (savedMode && LIGHT_MODES.includes(savedMode)) lightsMode = savedMode;
} catch {
  // Ignore storage errors
}

export function isLightsEnabled() {
  return lightsEnabled;
}

export function getLightsMode() {
  return lightsMode;
}

export function setLightsEnabled(on) {
  lightsEnabled = Boolean(on);
  try { localStorage.setItem(LIGHTS_ENABLED_KEY, String(lightsEnabled)); } catch {}
  syncLightsRootClasses();
  return lightsEnabled;
}

export function cycleLightsMode() {
  const idx = LIGHT_MODES.indexOf(lightsMode);
  lightsMode = LIGHT_MODES[(idx + 1) % LIGHT_MODES.length];
  try { localStorage.setItem(LIGHTS_MODE_KEY, lightsMode); } catch {}
  syncLightsRootClasses();
  return lightsMode;
}

export function setLightsEffect(effect) {
  const root = document.documentElement;
  root.classList.remove('fairy-lights-fast', 'fairy-lights-flash');
  if (effect === 'fast') root.classList.add('fairy-lights-fast');
  if (effect === 'flash') root.classList.add('fairy-lights-flash');
  if (effect === 'chase-temp') {
    root.classList.remove(...LIGHT_MODES.map((m) => `fairy-lights-mode-${m}`));
    root.classList.add('fairy-lights-mode-chase', 'fairy-lights-fast');
  } else {
    syncLightsRootClasses();
  }
}

export function syncLightsRootClasses() {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.toggle('fairy-lights-off', !lightsEnabled);
  for (const m of LIGHT_MODES) {
    root.classList.remove(`fairy-lights-mode-${m}`);
  }
  const activeMode = reduced ? 'steady' : lightsMode;
  root.classList.add(`fairy-lights-mode-${activeMode}`);
}

export function createFairyStrandSVG(bulbCount = 18, sag = 22, width = 600, height = 46) {
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? Math.min(bulbCount, 12) : bulbCount;
  const midX = width / 2;
  const endY = 6;
  const ctrlY = endY + sag * 2;

  let bulbsMarkup = '';
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * midX + t * t * width;
    const y = (1 - t) * (1 - t) * endY + 2 * (1 - t) * t * ctrlY + t * t * endY;
    const color = BULB_COLORS[i % BULB_COLORS.length];
    const dur = (0.8 + Math.random() * 1.8).toFixed(2);
    const delay = (Math.random() * 1.5).toFixed(2);
    const chaseDelay = (i * 0.08).toFixed(2);

    bulbsMarkup += `
      <g class="fairy-bulb" style="--dur:${dur}s;--delay:${delay}s;--chase-delay:${chaseDelay}s;">
        <rect x="${(x - 2).toFixed(1)}" y="${(y - 1).toFixed(1)}" width="4" height="4" rx="1" fill="#2A2A38" />
        <circle cx="${x.toFixed(1)}" cy="${(y + 7).toFixed(1)}" r="7" fill="${color}" opacity="0.24" />
        <ellipse cx="${x.toFixed(1)}" cy="${(y + 7).toFixed(1)}" rx="3.4" ry="5" fill="${color}" />
      </g>
    `;
  }

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
      <path d="M 0 ${endY} Q ${midX} ${ctrlY} ${width} ${endY}" fill="none" stroke="rgba(255,244,224,0.32)" stroke-width="1.3" />
      ${bulbsMarkup}
    </svg>
  `;
}

export function mountFairyLights() {
  syncLightsRootClasses();

  const topEl = document.getElementById('garland-top');
  if (topEl) {
    const isMobile = window.innerWidth < 768;
    topEl.innerHTML = createFairyStrandSVG(isMobile ? 14 : 26, 20, 1200, 46);
  }

  const machineEl = document.getElementById('garland-machine');
  if (machineEl) {
    machineEl.innerHTML = createFairyStrandSVG(14, 14, 520, 36);
  }

  const stripEl = document.getElementById('garland-strip');
  if (stripEl) {
    stripEl.innerHTML = createFairyStrandSVG(14, 10, 340, 32);
  }

  const sheetEl = document.getElementById('garland-sheet');
  if (sheetEl) {
    sheetEl.innerHTML = createFairyStrandSVG(12, 8, 360, 24);
  }

  // Bokeh orbs in background
  const bokehEl = document.getElementById('bokeh-layer');
  if (bokehEl && bokehEl.children.length === 0) {
    const orbSpecs = [
      { left: '8%', top: '18%', size: 140, color: '#E8283A', delay: '0s' },
      { left: '82%', top: '14%', size: 170, color: '#FFC83D', delay: '-4s' },
      { left: '16%', top: '74%', size: 160, color: '#17A35A', delay: '-8s' },
      { left: '78%', top: '68%', size: 150, color: '#4CC9F0', delay: '-11s' },
      { left: '48%', top: '42%', size: 120, color: '#FF4FA3', delay: '-6s' },
    ];
    for (const o of orbSpecs) {
      const div = document.createElement('div');
      div.className = 'bokeh-orb';
      div.style.cssText = `left:${o.left};top:${o.top};width:${o.size}px;height:${o.size}px;background:${o.color};animation-delay:${o.delay};`;
      bokehEl.appendChild(div);
    }
  }
}

