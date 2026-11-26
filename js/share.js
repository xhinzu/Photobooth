/**
 * Export & Share module:
 * - High-res PNG (3x) and JPG (2x) via the unified canvas renderer
 * - Animated buildup GIF89a encoder (pure JS, zero dependencies)
 * - Web Share API with files (navigator.share / navigator.canShare)
 * - WhatsApp, Instagram, Clipboard, and QR / Phone Transfer helpers
 *
 * Note: Instagram and WhatsApp have no public web API for sending images
 * directly into a DM or Story. Using the native Web Share API (`navigator.share({ files })`)
 * is the standard, reliable way on mobile browsers to hand off the image file
 * directly to those apps. On desktop where file sharing is unsupported, we
 * gracefully fall back to downloading the file or opening a clear guidance dialog.
 */

import { renderStripToCanvas } from './renderer.js';

function canvasToBlob(canvas, type = 'image/png', quality = 0.94) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function exportStripBlob(appState, format = 'png') {
  const scale = format === 'png' ? 3 : 2;
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const canvas = document.createElement('canvas');
  await renderStripToCanvas(canvas, appState, scale);
  return canvasToBlob(canvas, mime, 0.94);
}

export async function downloadPNG(appState) {
  const blob = await exportStripBlob(appState, 'png');
  triggerDownload(blob, `mistletoe-strip-${Date.now()}.png`);
  return blob;
}

export async function downloadJPG(appState) {
  const blob = await exportStripBlob(appState, 'jpg');
  triggerDownload(blob, `mistletoe-strip-${Date.now()}.jpg`);
  return blob;
}

export async function copyToClipboard(appState) {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('CLIPBOARD_UNSUPPORTED');
  }
  const blob = await exportStripBlob(appState, 'png');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export function canShareFiles() {
  if (!navigator.share || !navigator.canShare) return false;
  try {
    const testFile = new File([new Uint8Array([0])], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

export async function shareNativeFile(appState) {
  const blob = await exportStripBlob(appState, 'png');
  const file = new File([blob], 'mistletoe-photobooth.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: 'Mistletoe Photobooth',
      text: 'Fresh off the Mistletoe Photobooth.',
      files: [file],
    });
    return { shared: true, method: 'files' };
  }

  // Fallback to download if native file sharing is unavailable
  triggerDownload(blob, `mistletoe-strip-${Date.now()}.png`);
  return { shared: false, method: 'download' };
}

export async function shareWhatsApp(appState) {
  // Instagram and WhatsApp have no public web API for sending images directly into a DM;
  // native share sheet with file is the correct approach on mobile.
  if (canShareFiles()) {
    return shareNativeFile(appState);
  }
  const blob = await exportStripBlob(appState, 'png');
  triggerDownload(blob, `mistletoe-strip-${Date.now()}.png`);
  const text = encodeURIComponent('Just printed a strip on Mistletoe Photobooth!');
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  return { shared: false, method: 'wa-fallback' };
}

export async function shareInstagram(appState) {
  // Instagram has no public web API for sending images directly into DMs or Stories;
  // use Web Share API with file on mobile, or download + guidance dialog on desktop.
  if (canShareFiles()) {
    return shareNativeFile(appState);
  }
  const blob = await exportStripBlob(appState, 'png');
  triggerDownload(blob, `mistletoe-strip-${Date.now()}.png`);
  return { shared: false, method: 'ig-desktop-saved' };
}

/**
 * Lightweight pure-JS GIF89a encoder for the animated strip buildup.
 */
export async function downloadBuildupGIF(appState) {
  const total = appState.captures.length;
  const frameCanvas = document.createElement('canvas');
  const frames = [];

  for (let reveal = 1; reveal <= total; reveal++) {
    await renderStripToCanvas(frameCanvas, appState, 0.75, reveal);
    const ctx = frameCanvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
    frames.push({
      data: imgData.data,
      delay: reveal === total ? 140 : 45, // centiseconds
    });
  }

  const gifBytes = encodeGIF89a(frameCanvas.width, frameCanvas.height, frames);
  const blob = new Blob([gifBytes], { type: 'image/gif' });
  triggerDownload(blob, `mistletoe-buildup-${Date.now()}.gif`);
  return blob;
}

function encodeGIF89a(width, height, frames) {
  // Uniform 6x6x6 web-safe palette (216 colors) + 40 grays = 256 colors
  const palette = new Uint8Array(256 * 3);
  let idx = 0;
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        palette[idx++] = r * 51;
        palette[idx++] = g * 51;
        palette[idx++] = b * 51;
      }
    }
  }
  for (let i = 0; i < 40; i++) {
    const v = Math.round((i / 39) * 255);
    palette[idx++] = v;
    palette[idx++] = v;
    palette[idx++] = v;
  }

  const out = [];
  const writeStr = (s) => {
    for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
  };
  const write16 = (v) => {
    out.push(v & 0xff, (v >> 8) & 0xff);
  };

  // Header & Logical Screen Descriptor
  writeStr('GIF89a');
  write16(width);
  write16(height);
  out.push(0xf7, 0x00, 0x00); // Global color table (256 colors)
  for (let i = 0; i < palette.length; i++) out.push(palette[i]);

  // Netscape 2.0 loop block
  out.push(0x21, 0xff, 0x0b);
  writeStr('NETSCAPE2.0');
  out.push(0x03, 0x01, 0x00, 0x00, 0x00);

  for (const frame of frames) {
    // Graphic Control Extension
    out.push(0x21, 0xf9, 0x04, 0x00);
    write16(frame.delay);
    out.push(0x00, 0x00);

    // Image Descriptor
    out.push(0x2c);
    write16(0);
    write16(0);
    write16(width);
    write16(height);
    out.push(0x00);

    // Map RGBA pixels to 256-color palette
    const pixels = new Uint8Array(width * height);
    const d = frame.data;
    for (let p = 0, q = 0; p < pixels.length; p++, q += 4) {
      const r = d[q];
      const g = d[q + 1];
      const b = d[q + 2];
      const ri = Math.round(r / 51);
      const gi = Math.round(g / 51);
      const bi = Math.round(b / 51);
      pixels[p] = ri * 36 + gi * 6 + bi;
    }

    // LZW Compression (minCodeSize = 8)
    const minCodeSize = 8;
    out.push(minCodeSize);
    const compressed = lzwEncode(pixels, minCodeSize);
    for (let offset = 0; offset < compressed.length; offset += 255) {
      const len = Math.min(255, compressed.length - offset);
      out.push(len);
      for (let k = 0; k < len; k++) out.push(compressed[offset + k]);
    }
    out.push(0x00); // Block terminator
  }

  out.push(0x3b); // GIF Trailer
  return new Uint8Array(out);
}

function lzwEncode(pixels, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  let dict = new Map();

  const bytes = [];
  let bitBuf = 0;
  let bitCount = 0;

  const emit = (code) => {
    bitBuf |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(bitBuf & 0xff);
      bitBuf >>= 8;
      bitCount -= 8;
    }
  };

  const resetDict = () => {
    dict = new Map();
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  };

  emit(clearCode);
  let prefix = pixels[0];

  for (let i = 1; i < pixels.length; i++) {
    const k = pixels[i];
    const key = (prefix << 8) | k;
    if (dict.has(key)) {
      prefix = dict.get(key);
    } else {
      emit(prefix);
      if (nextCode < 4096) {
        dict.set(key, nextCode++);
        if (nextCode > 1 << codeSize && codeSize < 12) {
          codeSize++;
        }
      } else {
        emit(clearCode);
        resetDict();
      }
      prefix = k;
    }
  }

  emit(prefix);
  emit(eoiCode);
  if (bitCount > 0) bytes.push(bitBuf & 0xff);
  return bytes;
}

