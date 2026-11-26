/**
 * Camera stream management, frame capture as ImageBitmap,
 * synthesized analog audio cues, and studio test-frame generator.
 */

let activeStream = null;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playBeep(freq = 660, duration = 0.06, gainLevel = 0.05) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(gainLevel, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export function playShutterSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Mechanical click transient using short filtered noise
  const bufferSize = Math.floor(ctx.sampleRate * 0.055);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(1.2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.32, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

export function playPrinterSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.linearRampToValueAtTime(88, now + 1.4);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.035, now + 0.15);
  gain.gain.linearRampToValueAtTime(0.001, now + 1.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.55);
}

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
 * Generates editorial test studio frames when no camera is available
 * (e.g., desktop without webcam or permission denied fallback).
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

  // Soft studio spotlight gradient
  const grad = ctx.createRadialGradient(480, 320, 40, 480, 340, 440);
  grad.addColorStop(0, 'rgba(255, 253, 249, 0.55)');
  grad.addColorStop(1, 'rgba(22, 20, 18, 0.14)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Abstract editorial silhouette + geometric composition
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(480 + (poseIndex % 2 === 0 ? -24 : 24), 270, 96, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(480 + (poseIndex % 2 === 0 ? -18 : 18), 540, 185, 190, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Subtle registration marks
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

