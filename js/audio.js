/**
 * WebAudio synthesizer for Mistletoe Photobooth.
 * Generates all mechanical ticks, 120ms shutter thunk, printer whirr,
 * stepped advance clicks, and completion ding — zero external audio files.
 * Persists mute preference in localStorage.
 */

const STORAGE_KEY = 'mistletoe_sound_enabled';

let audioCtx = null;
let whirrNodes = null;
let crackleNodes = null;
let soundEnabled = loadSoundPreference();
let crackleEnabled = false;

function loadSoundPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  try {
    localStorage.setItem(STORAGE_KEY, String(soundEnabled));
  } catch {
    // Ignore storage errors in private browsing
  }
  if (!soundEnabled) {
    stopPrinterWhirr();
    stopVinylCrackle();
  }
  return soundEnabled;
}

export function isCrackleEnabled() {
  return crackleEnabled;
}

export function setCrackleEnabled(enabled) {
  crackleEnabled = Boolean(enabled);
  if (crackleEnabled && soundEnabled) startVinylCrackle();
  else stopVinylCrackle();
  return crackleEnabled;
}

export function startVinylCrackle() {
  const ctx = ensureAudioContext();
  if (!ctx || crackleNodes) return;
  const len = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() < 0.0025 ? (Math.random() * 2 - 1) * 0.65 : (Math.random() * 2 - 1) * 0.015;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(1200, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.03, ctx.currentTime);

  src.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  crackleNodes = { src, gain };
}

export function stopVinylCrackle() {
  if (!crackleNodes) return;
  try {
    crackleNodes.src.stop();
  } catch {
    // Ignore
  }
  crackleNodes = null;
}

export function playMusicBoxJingle() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const notes = [659.25, 659.25, 659.25, 783.99, 523.25, 587.33, 659.25];
  const now = ctx.currentTime;
  notes.forEach((freq, i) => {
    const t = now + i * 0.14;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  });
}

export function ensureAudioContext() {
  if (!soundEnabled) return null;
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

export function playCountdownTick(isFinalSecond = false) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(isFinalSecond ? 920 : 640, now);
  gain.gain.setValueAtTime(isFinalSecond ? 0.075 : 0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

/**
 * 120ms mechanical camera shutter "thunk" (low-end body + crisp leaf-shutter click).
 */
export function playShutterThunk() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // 1. Low-frequency mechanical body thunk (0..120ms)
  const osc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(175, now);
  osc.frequency.exponentialRampToValueAtTime(52, now + 0.115);
  bodyGain.gain.setValueAtTime(0.28, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(bodyGain);
  bodyGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.125);

  // 2. Crisp shutter curtain transient
  const len = Math.floor(ctx.sampleRate * 0.045);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.2));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.Q.setValueAtTime(1.1, now);

  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.26, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  noise.connect(filter);
  filter.connect(clickGain);
  clickGain.connect(ctx.destination);
  noise.start(now);
}

/**
 * Continuous soft mechanical whirr using low-pass filtered noise.
 */
export function startPrinterWhirr() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  stopPrinterWhirr();

  const now = ctx.currentTime;
  const bufferLen = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferLen; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(240, now);

  const hum = ctx.createOscillator();
  hum.type = 'sawtooth';
  hum.frequency.setValueAtTime(64, now);

  const humGain = ctx.createGain();
  humGain.gain.setValueAtTime(0.014, now);

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.linearRampToValueAtTime(0.055, now + 0.25);

  noise.connect(lowpass);
  lowpass.connect(masterGain);
  hum.connect(humGain);
  humGain.connect(masterGain);
  masterGain.connect(ctx.destination);

  noise.start(now);
  hum.start(now);
  whirrNodes = { noise, hum, masterGain };
}

export function stopPrinterWhirr() {
  if (!whirrNodes || !audioCtx) return;
  const { noise, hum, masterGain } = whirrNodes;
  whirrNodes = null;
  try {
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value || 0.04, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    noise.stop(now + 0.14);
    hum.stop(now + 0.14);
  } catch {
    // Ignore already-stopped nodes
  }
}

/**
 * Stepped "chk" tick synced to each mechanical advance step.
 */
export function playPrinterStepTick() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.022);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.28));
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(950 + Math.random() * 220, now);
  bp.Q.setValueAtTime(1.8, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

  src.connect(bp);
  bp.connect(gain);
  gain.connect(ctx.destination);
  src.start(now);
}

/**
 * Soft studio bell "ding" + mechanical settle click when print finishes.
 */
export function playPrintDing() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1318.5, now); // E6 soft chime
  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.58);
}

