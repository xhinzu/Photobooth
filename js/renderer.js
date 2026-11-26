/**
 * Single <canvas> rendering pipeline for photo strips.
 * Renders preview (1x) and high-res export (3x) from the exact same geometry & state.
 */

import { applyPhotoPipeline } from './filters.js';
import { loadStickerImage } from './stickers.js';

/**
 * Computes deterministic strip canvas dimensions and photo slot coordinates
 * at base 1x resolution.
 */
export function computeStripGeometry(poseCount, layout, borderWidth = 18, hasFooter = true) {
  const count = Math.max(1, poseCount || 4);
  const pad = Math.max(8, Number(borderWidth) || 18);
  const gap = Math.max(8, Math.round(pad * 0.65));
  const footerHeight = hasFooter ? 74 : Math.round(pad * 0.4);

  const slots = [];
  let width = 360;
  let height = 640;

  if (layout === 'double') {
    const colW = 220;
    const photoH = Math.round(colW * 0.75); // 4:3
    const stripW = colW + pad * 2;
    const gutter = 6;
    width = stripW * 2 + gutter;
    height = pad + count * photoH + (count - 1) * gap + footerHeight;

    for (let s = 0; s < 2; s++) {
      const xOffset = s * (stripW + gutter);
      for (let i = 0; i < count; i++) {
        slots.push({
          x: xOffset + pad,
          y: pad + i * (photoH + gap),
          w: colW,
          h: photoH,
          photoIndex: i,
          stripIndex: s,
        });
      }
    }
  } else if (layout === 'grid-2x2' || layout === 'grid-2x3') {
    const cols = 2;
    const rows = layout === 'grid-2x2' ? Math.max(2, Math.ceil(count / 2)) : Math.max(3, Math.ceil(count / 2));
    const cellW = 228;
    const cellH = Math.round(cellW * 0.75);
    width = pad * 2 + cols * cellW + gap;
    height = pad + rows * cellH + (rows - 1) * gap + footerHeight;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      slots.push({
        x: pad + col * (cellW + gap),
        y: pad + row * (cellH + gap),
        w: cellW,
        h: cellH,
        photoIndex: i,
        stripIndex: 0,
      });
    }
  } else {
    // 'single' vertical strip
    const photoW = 288;
    const photoH = Math.round(photoW * 0.75);
    width = photoW + pad * 2;
    height = pad + count * photoH + (count - 1) * gap + footerHeight;

    for (let i = 0; i < count; i++) {
      slots.push({
        x: pad,
        y: pad + i * (photoH + gap),
        w: photoW,
        h: photoH,
        photoIndex: i,
        stripIndex: 0,
      });
    }
  }

  return { width, height, slots, pad, gap, footerHeight };
}

function getContrastInk(hexColor) {
  const hex = (hexColor || '#FFFDF9').replace('#', '');
  if (hex.length !== 6) return '#161412';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.45 ? '#F6E9DC' : '#161412';
}

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function getFontStack(fontKey) {
  if (fontKey === 'display') return '"Anton", Impact, sans-serif';
  if (fontKey === 'sans') return '"DM Sans", sans-serif';
  return '"IBM Plex Mono", monospace';
}

/**
 * Renders the full strip onto `targetCanvas` at `scale` (e.g., 1 for preview, 3 for PNG export).
 * Optionally limits visible photos via `revealCount` for animated buildup GIFs.
 */
export async function renderStripToCanvas(targetCanvas, appState, scale = 1, revealCount = Infinity) {
  const { captures, edits } = appState;
  const { frame, adjustments, perPhoto, overlays, strokes } = edits;
  const hasFooter = Boolean(frame.caption || frame.showDate || frame.showBranding);
  const geom = computeStripGeometry(captures.length, frame.layout, frame.borderWidth, hasFooter);

  targetCanvas.width = Math.round(geom.width * scale);
  targetCanvas.height = Math.round(geom.height * scale);

  const ctx = targetCanvas.getContext('2d');
  ctx.save();
  ctx.scale(scale, scale);

  // 1. Paper Background
  ctx.fillStyle = frame.bgColor || '#FFFDF9';
  ctx.fillRect(0, 0, geom.width, geom.height);

  // If double strip, draw subtle perforation cut line down the center
  if (frame.layout === 'double') {
    const midX = geom.width / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(22, 20, 18, 0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, geom.height);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Render Each Photo Slot
  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

  for (const slot of geom.slots) {
    if (slot.photoIndex >= revealCount) {
      // Empty unrevealed frame for buildup animation
      ctx.save();
      drawRoundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, frame.cornerRadius);
      ctx.fillStyle = 'rgba(22, 20, 18, 0.08)';
      ctx.fill();
      ctx.restore();
      continue;
    }

    const cap = captures[slot.photoIndex];
    if (!cap || !cap.bitmap) continue;

    const photoOverride = perPhoto[slot.photoIndex] || {};
    const activeFilter = photoOverride.filter || edits.filter;
    const zoom = photoOverride.zoom || 1;
    const flipX = Boolean(photoOverride.flipX);

    const pw = Math.round(slot.w * scale);
    const ph = Math.round(slot.h * scale);
    if (offscreen.width !== pw || offscreen.height !== ph) {
      offscreen.width = pw;
      offscreen.height = ph;
    }

    offCtx.save();
    offCtx.clearRect(0, 0, pw, ph);
    if (flipX) {
      offCtx.translate(pw, 0);
      offCtx.scale(-1, 1);
    }

    // Center-crop zoom
    const srcW = cap.bitmap.width;
    const srcH = cap.bitmap.height;
    const cropW = srcW / zoom;
    const cropH = srcH / zoom;
    const sx = (srcW - cropW) / 2;
    const sy = (srcH - cropH) / 2;
    offCtx.drawImage(cap.bitmap, sx, sy, cropW, cropH, 0, 0, pw, ph);
    offCtx.restore();

    applyPhotoPipeline(offCtx, pw, ph, activeFilter, adjustments);

    // Draw into rounded clip on main strip
    ctx.save();
    drawRoundedRectPath(ctx, slot.x, slot.y, slot.w, slot.h, frame.cornerRadius);
    ctx.clip();
    ctx.drawImage(offscreen, slot.x, slot.y, slot.w, slot.h);
    ctx.restore();
  }

  // 3. Footer Caption, Date Stamp, and Branding
  if (hasFooter) {
    const inkColor = getContrastInk(frame.bgColor);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).toUpperCase();

    const drawFooterBlock = (centerX, bottomY, maxW) => {
      ctx.save();
      ctx.fillStyle = inkColor;
      ctx.textAlign = 'center';

      if (frame.caption) {
        const fontSize = frame.captionFont === 'display' ? 18 : 13;
        ctx.font = `600 ${fontSize}px ${getFontStack(frame.captionFont)}`;
        ctx.fillText(frame.caption, centerX, bottomY - 32, maxW);
      }

      const metaParts = [];
      if (frame.showDate) metaParts.push(dateStr);
      if (frame.showBranding) metaParts.push('MISTLETOE STUDIO');
      if (metaParts.length > 0) {
        ctx.globalAlpha = 0.7;
        ctx.font = '500 9.5px "IBM Plex Mono", monospace';
        ctx.fillText(metaParts.join(' · '), centerX, bottomY - 14, maxW);
      }
      ctx.restore();
    };

    if (frame.layout === 'double') {
      const stripW = (geom.width - 6) / 2;
      drawFooterBlock(stripW / 2, geom.height, stripW - 24);
      drawFooterBlock(stripW + 6 + stripW / 2, geom.height, stripW - 24);
    } else {
      drawFooterBlock(geom.width / 2, geom.height, geom.width - 28);
    }
  }

  // 4. Freehand Ink Strokes
  if (strokes && strokes.length > 0) {
    const inkCanvas = document.createElement('canvas');
    inkCanvas.width = Math.round(geom.width * scale);
    inkCanvas.height = Math.round(geom.height * scale);
    const ictx = inkCanvas.getContext('2d');
    ictx.scale(scale, scale);
    ictx.lineCap = 'round';
    ictx.lineJoin = 'round';

    for (const stroke of strokes) {
      if (!stroke.points || stroke.points.length < 1) continue;
      ictx.save();
      ictx.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over';
      ictx.strokeStyle = stroke.color || '#161412';
      ictx.lineWidth = stroke.size || 4;
      ictx.beginPath();
      const first = stroke.points[0];
      ictx.moveTo(first.x * geom.width, first.y * geom.height);
      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i];
        ictx.lineTo(pt.x * geom.width, pt.y * geom.height);
      }
      if (stroke.points.length === 1) {
        ictx.lineTo(first.x * geom.width + 0.1, first.y * geom.height);
      }
      ictx.stroke();
      ictx.restore();
    }
    ctx.drawImage(inkCanvas, 0, 0, geom.width, geom.height);
  }

  // 5. Stickers & Text Overlays
  if (overlays && overlays.length > 0) {
    for (const item of overlays) {
      const cx = item.x * geom.width;
      const cy = item.y * geom.height;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(((item.rotation || 0) * Math.PI) / 180);
      ctx.scale(item.scale || 1, item.scale || 1);

      if (item.kind === 'sticker') {
        const img = await loadStickerImage(item.stickerId);
        if (img) {
          const w = item.width || 68;
          const h = item.height || 68;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
      } else if (item.kind === 'text') {
        const fontSize = item.fontSize || 22;
        ctx.font = `600 ${fontSize}px ${getFontStack(item.font || 'sans')}`;
        ctx.fillStyle = item.color || '#161412';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.text || '', 0, 0);
      }

      ctx.restore();
    }
  }

  ctx.restore();
  return geom;
}

