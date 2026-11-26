/**
 * Canvas theme-rendering engine with cached pattern tiles and live mini-preview generator.
 */

const patternCache = new Map();

function getKraftTile() {
  if (patternCache.has('kraft')) return patternCache.get('kraft');
  const tile = document.createElement('canvas');
  tile.width = 96;
  tile.height = 96;
  const ctx = tile.getContext('2d');
  ctx.fillStyle = '#D7B996';
  ctx.fillRect(0, 0, 96, 96);
  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(92, 62, 36, 0.08)' : 'rgba(255, 248, 236, 0.09)';
    ctx.fillRect(Math.random() * 96, Math.random() * 96, 1 + Math.random() * 2, 1);
  }
  patternCache.set('kraft', tile);
  return tile;
}

function getHalftoneTile() {
  if (patternCache.has('halftone')) return patternCache.get('halftone');
  const tile = document.createElement('canvas');
  tile.width = 14;
  tile.height = 14;
  const ctx = tile.getContext('2d');
  ctx.fillStyle = 'rgba(42, 123, 123, 0.09)';
  ctx.beginPath();
  ctx.arc(4, 4, 1.8, 0, Math.PI * 2);
  ctx.arc(11, 11, 1.8, 0, Math.PI * 2);
  ctx.fill();
  patternCache.set('halftone', tile);
  return tile;
}

export function drawThemeBackground(ctx, width, height, theme, overrideBgColor = null) {
  const bg = theme.background;
  if (overrideBgColor && overrideBgColor !== bg.color) {
    ctx.fillStyle = overrideBgColor;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bg.type === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, bg.color);
    grad.addColorStop(1, bg.secondary || bg.color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'kraft') {
    const pat = ctx.createPattern(getKraftTile(), 'repeat');
    ctx.fillStyle = pat || bg.color;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  }
}

export function drawThemeBorder(ctx, width, height, theme) {
  const { style, color } = theme.border;
  ctx.save();

  if (style === 'chrome') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.35, '#9FB8D6');
    grad.addColorStop(0.65, '#E8F2FC');
    grad.addColorStop(1, '#6E88A8');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, width - 6, height - 6);
  } else if (style === 'candy-cane') {
    ctx.strokeStyle = '#B53D2A';
    ctx.lineWidth = 8;
    ctx.setLineDash([12, 12]);
    ctx.strokeRect(4, 4, width - 8, height - 8);
    ctx.strokeStyle = '#FFFDF9';
    ctx.lineDashOffset = 12;
    ctx.strokeRect(4, 4, width - 8, height - 8);
  } else if (style === 'sprocket') {
    // 35mm film sprocket holes along left & right edges
    ctx.fillStyle = '#F2ECE4';
    const holeW = 8;
    const holeH = 12;
    const step = 22;
    for (let y = 12; y < height - 16; y += step) {
      ctx.fillRect(5, y, holeW, holeH);
      ctx.fillRect(width - 5 - holeW, y, holeW, holeH);
    }
  } else if (style === 'scalloped') {
    ctx.fillStyle = '#F3B6C8';
    const r = 6;
    for (let x = r; x < width; x += r * 2.2) {
      ctx.beginPath();
      ctx.arc(x, 0, r, 0, Math.PI);
      ctx.arc(x, height, r, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  } else if (style === 'checkerboard') {
    const sq = 8;
    for (let x = 0; x < width; x += sq) {
      const idx = Math.floor(x / sq);
      ctx.fillStyle = idx % 2 === 0 ? '#D49A2A' : '#2A7B7B';
      ctx.fillRect(x, 0, sq, sq);
      ctx.fillRect(x, height - sq, sq, sq);
    }
  } else if (style === 'torn') {
    ctx.strokeStyle = 'rgba(42, 30, 22, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, 2);
    for (let x = 4; x < width; x += 10) {
      ctx.lineTo(x, 2 + ((x * 7) % 3));
    }
    ctx.stroke();
  } else if (style === 'solid' && theme.id === 'minimal') {
    ctx.strokeStyle = 'rgba(22, 20, 18, 0.14)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }

  ctx.restore();
}

export function drawThemeOverlay(ctx, width, height, slots, theme, phase = 'above') {
  const { type, layer } = theme.overlay;
  if (type === 'none' || layer !== phase) return;

  ctx.save();

  if (type === 'halftone') {
    const pat = ctx.createPattern(getHalftoneTile(), 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (type === 'sparkles') {
    const pts = [
      [0.08, 0.12], [0.92, 0.16], [0.1, 0.52], [0.9, 0.48], [0.12, 0.86], [0.88, 0.84],
    ];
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#3A7BD5';
    ctx.lineWidth = 1;
    for (const [px, py] of pts) {
      const cx = px * width;
      const cy = py * height;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 7);
      ctx.quadraticCurveTo(cx + 1, cy - 1, cx + 7, cy);
      ctx.quadraticCurveTo(cx + 1, cy + 1, cx, cy + 7);
      ctx.quadraticCurveTo(cx - 1, cy + 1, cx - 7, cy);
      ctx.quadraticCurveTo(cx - 1, cy - 1, cx, cy - 7);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === 'snow') {
    ctx.fillStyle = 'rgba(255, 253, 249, 0.85)';
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 73 + 19) % 97) / 100 * width;
      const sy = ((i * 47 + 11) % 95) / 100 * height;
      const r = 1.5 + (i % 3);
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Mistletoe corner accent
    ctx.fillStyle = '#587D58';
    ctx.beginPath();
    ctx.ellipse(22, 22, 8, 4, -0.5, 0, Math.PI * 2);
    ctx.ellipse(34, 24, 8, 4, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B53D2A';
    ctx.beginPath();
    ctx.arc(28, 25, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'sprocket-numbers') {
    ctx.fillStyle = 'rgba(242, 236, 228, 0.72)';
    ctx.font = '600 8px "IBM Plex Mono", monospace';
    for (const s of slots) {
      if (s.stripIndex === 0) {
        ctx.fillText(`${s.photoIndex + 1}A`, s.x - 15, s.y + s.h / 2);
      }
    }
  } else if (type === 'hearts-stars') {
    const pts = [[0.09, 0.14], [0.91, 0.22], [0.09, 0.62], [0.9, 0.74]];
    ctx.fillStyle = '#C95B7A';
    for (const [px, py] of pts) {
      const x = px * width;
      const y = py * height;
      ctx.beginPath();
      ctx.arc(x - 2.5, y, 2.8, 0, Math.PI * 2);
      ctx.arc(x + 2.5, y, 2.8, 0, Math.PI * 2);
      ctx.lineTo(x, y + 6);
      ctx.closePath();
      ctx.fill();
    }
  } else if (type === 'doodles') {
    ctx.strokeStyle = 'rgba(42, 30, 22, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(12, 16);
    ctx.quadraticCurveTo(22, 10, 32, 16);
    ctx.moveTo(width - 34, height - 18);
    ctx.quadraticCurveTo(width - 22, height - 24, width - 12, height - 18);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawWashiTapeCorners(ctx, slot, index) {
  ctx.save();
  ctx.fillStyle = index % 2 === 0 ? 'rgba(181, 61, 42, 0.68)' : 'rgba(212, 154, 42, 0.68)';
  ctx.translate(slot.x + 10, slot.y);
  ctx.rotate(-0.45);
  ctx.fillRect(-14, -5, 28, 10);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = index % 2 === 0 ? 'rgba(58, 90, 64, 0.68)' : 'rgba(181, 61, 42, 0.68)';
  ctx.translate(slot.x + slot.w - 10, slot.y + slot.h);
  ctx.rotate(-0.45);
  ctx.fillRect(-14, -5, 28, 10);
  ctx.restore();
}

/**
 * Renders a live mini strip preview for Theme Selector cards.
 */
export function renderThemeMiniPreview(canvas, theme, captures = []) {
  const w = 88;
  const h = 128;
  canvas.width = w * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  drawThemeBackground(ctx, w, h, theme);
  drawThemeOverlay(ctx, w, h, [], theme, 'below');

  const pad = 10;
  const gap = 5;
  const slotW = w - pad * 2;
  const slotH = 26;

  for (let i = 0; i < 3; i++) {
    const sy = pad + i * (slotH + gap);
    ctx.save();
    if (theme.photoFrame.tiltMaxDeg > 0) {
      const tilt = (i % 2 === 0 ? -1 : 1) * 0.03;
      ctx.translate(w / 2, sy + slotH / 2);
      ctx.rotate(tilt);
      ctx.translate(-w / 2, -(sy + slotH / 2));
    }

    if (theme.photoFrame.shape === 'polaroid') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(pad - 2, sy - 2, slotW + 4, slotH + 7);
    }

    const cap = captures[i];
    if (cap && cap.bitmap) {
      ctx.drawImage(cap.bitmap, pad, sy, slotW, slotH);
    } else {
      ctx.fillStyle = theme.id === 'film-noir' ? '#2A2826' : '#D9CBBF';
      ctx.fillRect(pad, sy, slotW, slotH);
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.arc(w / 2, sy + slotH * 0.45, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawThemeBorder(ctx, w, h, theme);
  drawThemeOverlay(ctx, w, h, [], theme, 'above');
}
