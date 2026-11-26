/**
 * Single-canvas Christmas Night Ambience overlay:
 * - Falling snow (50-90 flakes on desktop, reduced on mobile, wind drift)
 * - Slow twinkling background stars
 * - Festive red/green/gold sparkle burst on Start
 * - Pauses when tab hidden or under prefers-reduced-motion
 */

let canvas = null;
let ctx = null;
let rafId = 0;
let running = false;
let lastFrameTime = 0;
let snowflakes = [];
let stars = [];
const bursts = [];

function initParticles() {
  const isMobile = window.innerWidth <= 767;
  const snowCount = isMobile ? 32 : 74;
  snowflakes = Array.from({ length: snowCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 1 + Math.random() * 2.5,
    speed: 0.45 + Math.random() * 1.15,
    drift: 0.12 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.32 + Math.random() * 0.55,
  }));

  const starCount = isMobile ? 16 : 28;
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight * 0.72,
    r: 0.8 + Math.random() * 1.3,
    phase: Math.random() * Math.PI * 2,
    speed: 0.015 + Math.random() * 0.025,
  }));
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

export function triggerSparkleBurst(cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.6) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#E8283A', '#17A35A', '#FFC83D', '#4CC9F0', '#FFF4E0'];
  for (let i = 0; i < 28; i++) {
    const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.25;
    const speed = 2.2 + Math.random() * 4.5;
    bursts.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      r: 2 + Math.random() * 2.5,
      color: colors[i % colors.length],
      life: 1,
    });
  }
}

export function startFilmFX(canvasEl) {
  canvas = canvasEl;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);
  running = true;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const st of stars) {
      ctx.fillStyle = 'rgba(255, 244, 224, 0.45)';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  const loop = (now) => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (document.hidden) return;
    if (now - lastFrameTime < 22) return;
    lastFrameTime = now;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Twinkling stars
    for (const st of stars) {
      st.phase += st.speed;
      const a = 0.18 + (Math.sin(st.phase) * 0.5 + 0.5) * 0.62;
      ctx.fillStyle = `rgba(255, 244, 224, ${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Depth-based snow with gentle wind drift
    for (const f of snowflakes) {
      f.phase += 0.02;
      f.y += f.speed;
      f.x += f.drift + Math.sin(f.phase) * 0.25;
      if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
      if (f.x > w + 4) f.x = -4;
      ctx.fillStyle = `rgba(255, 244, 224, ${f.alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Start-button sparkle bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.12;
      b.life -= 0.032;
      if (b.life <= 0) {
        bursts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = b.life;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  rafId = requestAnimationFrame(loop);
}

export function stopFilmFX() {
  running = false;
  cancelAnimationFrame(rafId);
}
