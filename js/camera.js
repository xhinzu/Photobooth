/**
 * Camera stream management, frame capture as ImageBitmap,
 * and studio test-frame generator.
 */

let activeStream = null;

export async function startCamera(videoEl, facingMode = 'user') {
  stopCamera();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('UNSUPPORTED_CONTEXT');
  }

  const constraints = {
    audio: false,
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 960 },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  activeStream = stream;
  videoEl.srcObject = stream;

  await new Promise((resolve) => {
    if (videoEl.readyState >= 2) {
      resolve();
    } else {
      videoEl.onloadedmetadata = () => resolve();
    }
  });

  await videoEl.play().catch(() => {});
  return stream;
}

export function stopCamera() {
  if (activeStream) {
    for (const track of activeStream.getTracks()) {
      track.stop();
    }
    activeStream = null;
  }
}

export function hasActiveCamera() {
  return Boolean(activeStream && activeStream.getVideoTracks().some((t) => t.readyState === 'live'));
}

export async function captureVideoFrame(videoEl, mirrored = true) {
  const vw = videoEl.videoWidth || 1280;
  const vh = videoEl.videoHeight || 960;

  // Normalize to 4:3 studio frame
  const targetRatio = 4 / 3;
  let sx = 0;
  let sy = 0;
  let sw = vw;
  let sh = vh;

  if (vw / vh > targetRatio) {
    sw = vh * targetRatio;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / targetRatio;
    sy = (vh - sh) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  if (mirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const bitmap = await createImageBitmap(canvas);
  const thumbUrl = canvas.toDataURL('image/jpeg', 0.72);
  return { bitmap, thumbUrl };
}

/**
 * Generates editorial test studio frames when no camera is available.
 */
export async function generateStudioTestFrame(poseIndex, totalPoses) {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  const palettes = [
    ['#E8D5C4', '#B53D2A', '#2B2420'],
    ['#D8E0D2', '#3A5A40', '#161412'],
    ['#DFD3C8', '#7C4D3A', '#1E1A17'],
    ['#E4D8CC', '#8F3B2E', '#231F1D'],
  ];
  const [bg, accent, ink] = palettes[poseIndex % palettes.length];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createRadialGradient(480, 320, 40, 480, 340, 440);
  grad.addColorStop(0, 'rgba(255, 253, 249, 0.55)');
  grad.addColorStop(1, 'rgba(22, 20, 18, 0.14)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(480 + (poseIndex % 2 === 0 ? -24 : 24), 270, 96, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(480 + (poseIndex % 2 === 0 ? -18 : 18), 540, 185, 190, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(22, 20, 18, 0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = ink;
  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.fillText(`STUDIO FRAME 0${poseIndex + 1} / 0${totalPoses}`, 60, 82);

  const bitmap = await createImageBitmap(canvas);
  const thumbUrl = canvas.toDataURL('image/jpeg', 0.8);
  return { bitmap, thumbUrl };
}
