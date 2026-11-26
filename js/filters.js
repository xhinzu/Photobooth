/**
 * Film & tone filter presets + pixel-level canvas adjustment pipeline.
 */

export const FILTERS = [
  {
    id: 'color',
    label: 'Color',
    swatch: '#D48C46',
    cssPreview: 'none',
  },
  {
    id: 'bw',
    label: 'B&W',
    swatch: '#3A3633',
    cssPreview: 'grayscale(1) contrast(1.08)',
  },
  {
    id: 'hc-bw',
    label: 'High-Contrast B&W',
    swatch: '#161412',
    cssPreview: 'grayscale(1) contrast(1.42) brightness(1.04)',
  },
  {
    id: 'sepia',
    label: 'Sepia',
    swatch: '#9B7653',
    cssPreview: 'sepia(0.82) contrast(1.05)',
  },
  {
    id: 'warm',
    label: 'Warm Film',
    swatch: '#C96A4B',
    cssPreview: 'sepia(0.24) saturate(1.16) contrast(1.06) brightness(1.02)',
  },
  {
    id: 'cool',
    label: 'Cool Film',
    swatch: '#5B7B8C',
    cssPreview: 'saturate(0.92) contrast(1.08) hue-rotate(12deg)',
  },
  {
    id: 'faded',
    label: 'Faded',
    swatch: '#B9ABA0',
    cssPreview: 'contrast(0.84) brightness(1.08) saturate(0.78)',
  },
  {
    id: 'vintage',
    label: 'Vintage Fade',
    swatch: '#A8896C',
    cssPreview: 'sepia(0.38) contrast(0.88) brightness(1.05) saturate(0.82)',
  },
];

export function getFilterById(id) {
  return FILTERS.find((f) => f.id === id) || FILTERS[0];
}

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/**
 * Applies filter + slider adjustments directly to a canvas context's pixel buffer.
 */
export function applyPhotoPipeline(ctx, width, height, filterId, adj) {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));

  // Softness / blur pass using canvas filter if needed
  if (adj.blur > 0) {
    const temp = document.createElement('canvas');
    temp.width = w;
    temp.height = h;
    const tctx = temp.getContext('2d');
    tctx.filter = `blur(${(adj.blur * 0.25).toFixed(2)}px)`;
    tctx.drawImage(ctx.canvas, 0, 0, w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(temp, 0, 0);
  }

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const bright = (adj.brightness || 0) * 1.4; // -100..100 -> -140..140
  const contrastFactor = Math.pow((100 + (adj.contrast || 0)) / 100, 1.3);
  const satFactor = Math.max(0, 1 + (adj.saturation || 0) / 100);
  const warmth = (adj.warmth || 0) * 0.65;
  const grainAmt = (adj.grain || 0) * 0.65;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Brightness & Warmth
    r += bright + warmth;
    g += bright + warmth * 0.2;
    b += bright - warmth;

    // 2. Saturation
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + (r - lum) * satFactor;
    g = lum + (g - lum) * satFactor;
    b = lum + (b - lum) * satFactor;

    // 3. Contrast
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    // 4. Filter preset tone
    if (filterId === 'bw') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const gContrast = (gray - 128) * 1.12 + 128;
      r = g = b = gContrast;
    } else if (filterId === 'hc-bw') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const gContrast = (gray - 128) * 1.52 + 132;
      r = g = b = gContrast;
    } else if (filterId === 'sepia') {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      r = r * 0.18 + sr * 0.82;
      g = g * 0.18 + sg * 0.82;
      b = b * 0.18 + sb * 0.82;
    } else if (filterId === 'warm') {
      r = r * 1.07 + 8;
      g = g * 1.02 + 3;
      b = b * 0.92 - 4;
    } else if (filterId === 'cool') {
      r = r * 0.93 - 3;
      g = g * 1.01 + 2;
      b = b * 1.09 + 8;
    } else if (filterId === 'faded') {
      r = r * 0.86 + 24;
      g = g * 0.86 + 22;
      b = b * 0.86 + 24;
    } else if (filterId === 'vintage') {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      r = (r * 0.62 + sr * 0.38) * 0.9 + 18;
      g = (g * 0.62 + sg * 0.38) * 0.9 + 15;
      b = (b * 0.62 + sb * 0.38) * 0.88 + 14;
    }

    // 5. Film Grain
    if (grainAmt > 0) {
      const noise = (Math.random() - 0.5) * grainAmt;
      r += noise;
      g += noise;
      b += noise;
    }

    data[i] = clampByte(r);
    data[i + 1] = clampByte(g);
    data[i + 2] = clampByte(b);
  }

  // 6. Sharpness (lightweight 3x3 unsharp kernel)
  if ((adj.sharpness || 0) > 0) {
    const amount = (adj.sharpness / 100) * 0.75;
    const src = new Uint8ClampedArray(data);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = src[idx + c];
          const neighbors =
            (src[idx - 4 + c] +
              src[idx + 4 + c] +
              src[idx - w * 4 + c] +
              src[idx + w * 4 + c]) *
            0.25;
          data[idx + c] = clampByte(center + (center - neighbors) * amount);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 7. Vignette
  if ((adj.vignette || 0) > 0) {
    const strength = Math.min(0.85, (adj.vignette / 100) * 0.78);
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.hypot(cx, cy);
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
    grad.addColorStop(0, 'rgba(22, 20, 18, 0)');
    grad.addColorStop(1, `rgba(22, 20, 18, ${strength.toFixed(3)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

