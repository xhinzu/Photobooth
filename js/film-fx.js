/**
 * Single-canvas 1940s-50s Film FX overlay:
 * - Animated film grain (~12fps), subtle flicker, random vertical scratches & dust (80-150ms)
 * - Depth-based falling B&W snow on setup & editor screens
 * - Capped at 30fps, paused when tab is hidden, static grain under prefers-reduced-motion
 */

let canvas = null;
let ctx = null;
let rafId = 0;
let running = false;
let lastFrameTime = 0;
let lastGrainTime = 0;
let grainCanvas = null;
let grainCtx = null;

const scratches = [];
const dustSpecks = [];
let snowflakes = [];

function initGrainBuffer() {
  grainCanvas = document.createElement('canvas');
  grainCanvas.width = 160;
  grainCanvas.height = 160;
  grainCtx = grainCanvas.getContext('2d');
  refreshGrain();
}

function refreshGrain() {
  if (!grainCtx) return;
  const img = grainCtx.createImageData(160, 160);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 22; // ~8.5% opacity
  }
  grainCtx.putImageData(img, 0, 0);
}

function initSnowflakes() {
  const isSmall = window.innerWidth <= 480;
  const count = isSmall ? 28 : 58; // 40-80 on desktop, reduced on low-end/mobile
  snowflakes = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 1 + Math.random() * 2.4,
    speed: 0.4 + Math.random() * 1.1,
    drift: (Math.random() - 0.5) * 0.45,
    alpha: 0.3 + Math.random() * 0.55,
  }));
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initSnowflakes();
}

export function startFilmFX(canvasEl, getStateFn) {
  canvas = canvasEl;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  if (!grainCanvas) initGrainBuffer();
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && running) {
      lastFrameTime = performance.now();
    }
  });

  running = true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // Static grain only under prefers-reduced-motion
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pat = ctx.createPattern(grainCanvas, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return;
  }

  const loop = (now) => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);

    if (document.hidden) return;
    const appState = getStateFn ? getStateFn() : { filmMode: true, screen: 'booth' };
    if (!appState.filmMode) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Cap at 30fps (~33ms)
    if (now - lastFrameTime < 33) return;
    lastFrameTime = now;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Refresh grain at ~12fps (83ms)
    if (now - lastGrainTime > 83) {
      lastGrainTime = now;
      refreshGrain();
    }
    const pat = ctx.createPattern(grainCanvas, 'repeat');
    if (pat) {
      ctx.save();
      ctx.globalAlpha = 0.97 + Math.random() * 0.03; // Subtle flicker
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 2. Random vertical scratches (80-150ms)
    if (Math.random() < 0.06 && scratches.length < 2) {
      scratches.push({
        x: Math.random() * w,
        until: now + 80 + Math.random() * 70,
        alpha: 0.08 + Math.random() * 0.12,
      });
    }
    for (let i = scratches.length - 1; i >= 0; i--) {
      const sc = scratches[i];
      if (now > sc.until) {
        scratches.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(237, 235, 230, ${sc.alpha.toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sc.x, 0);
      ctx.lineTo(sc.x + (Math.random() - 0.5) * 2, h);
      ctx.stroke();
    }

    // 3. Random dust specks (80-150ms)
    if (Math.random() < 0.12 && dustSpecks.length < 6) {
      dustSpecks.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 1.4,
        until: now + 80 + Math.random() * 70,
      });
    }
    ctx.fillStyle = 'rgba(237, 235, 230, 0.35)';
    for (let i = dustSpecks.length - 1; i >= 0; i--) {
      const d = dustSpecks[i];
      if (now > d.until) {
        dustSpecks.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Falling B&W snow on setup and editor screens
    if (appState.screen === 'booth' || appState.screen === 'editor') {
      for (const f of snowflakes) {
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > h + 4) {
          f.y = -4;
          f.x = Math.random() * w;
        }
        if (f.x < 0) f.x = w;
        if (f.x > w) f.x = 0;

        ctx.fillStyle = `rgba(237, 235, 230, ${f.alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  rafId = requestAnimationFrame(loop);
}

export function stopFilmFX() {
  running = false;
  cancelAnimationFrame(rafId);
}
