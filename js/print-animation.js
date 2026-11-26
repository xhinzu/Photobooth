/**
 * Cinematic 6.5s mechanical printing sequence:
 * 1. Transition (0.0-0.8s): Amber blinking LED, "DEVELOPING..." status
 * 2. Processing (0.8-1.6s): Glowing printer slot line, WebAudio whirr, 1px jitter
 * 3. Printing (1.6-6.0s): Irregular stepped emergence, sequential photo developing,
 *    paper curl wobble, light sweep, falling dust particles, synced chk-chk ticks
 * 4. Finish (6.0-6.5s): Green LED, 8px settle drop + bounce, soft ding, "Fresh off the press."
 */

import { renderStripToCanvas } from './renderer.js';
import {
  startPrinterWhirr,
  stopPrinterWhirr,
  playPrinterStepTick,
  playPrintDing,
} from './audio.js';

export const PRINT_DURATION_MS = 6500;

let activeCancel = null;

function buildIrregularStepSchedule(startMs, endMs) {
  const steps = [];
  let t = startMs;
  let progress = 0;
  while (t < endMs && progress < 1) {
    const pause = 62 + Math.random() * 44; // 62-106ms irregular mechanical pause
    const advance = 0.022 + Math.random() * 0.026;
    t += pause;
    progress = Math.min(1, progress + advance);
    steps.push({ time: Math.min(t, endMs), progress });
  }
  if (steps.length === 0 || steps[steps.length - 1].progress < 1) {
    steps.push({ time: endMs, progress: 1 });
  }
  return steps;
}

function spawnDustParticle(container, themeId = 'minimal') {
  if (!container) return;
  const dot = document.createElement('span');
  dot.className = `paper-dust ${themeId === 'christmas' ? 'is-snow' : themeId === 'y2k' || themeId === 'kawaii' ? 'is-sparkle' : ''}`;
  dot.style.left = `${15 + Math.random() * 70}%`;
  dot.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 26}px`);
  container.appendChild(dot);
  setTimeout(() => dot.remove(), 1100);
}

/**
 * Plays the printing sequence and resolves when finished or skipped.
 */
export async function playPrintSequence(appState, dom) {
  if (activeCancel) {
    activeCancel();
    activeCancel = null;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const {
    printerMachine,
    printerLed,
    printerSlotGlow,
    printingStatus,
    printingCaption,
    printedStripCard,
    printingCanvas,
    developingVeilLayer,
    lightSweep,
    dustLayer,
    btnSkipPrint,
  } = dom;

  // Render final strip once to offscreen/target canvas
  const geom = await renderStripToCanvas(printingCanvas, appState, 1);

  // Build sequential developing veils aligned to each photo slot
  developingVeilLayer.innerHTML = '';
  const uniqueRows = [];
  for (const s of geom.slots) {
    if (!uniqueRows.some((r) => Math.abs(r.y - s.y) < 4 && r.photoIndex === s.photoIndex)) {
      uniqueRows.push(s);
    }
  }
  const veils = uniqueRows.map((slot) => {
    const veil = document.createElement('div');
    veil.className = 'develop-veil';
    veil.style.left = `${(slot.x / geom.width) * 100}%`;
    veil.style.top = `${(slot.y / geom.height) * 100}%`;
    veil.style.width = `${(slot.w / geom.width) * 100}%`;
    veil.style.height = `${(slot.h / geom.height) * 100}%`;
    developingVeilLayer.appendChild(veil);
    return veil;
  });

  // Reset visual state
  printerLed.dataset.state = 'printing';
  printerSlotGlow.classList.remove('is-lit');
  printerMachine.classList.remove('is-jittering');
  printingCaption.classList.remove('is-visible');
  printedStripCard.classList.remove('is-settled', 'is-reduced-fade');
  printedStripCard.style.transform = 'translateY(-102%) rotate(0deg)';
  printedStripCard.style.boxShadow = 'none';
  lightSweep.style.opacity = '0';
  printingStatus.textContent = 'DEVELOPING...';

  const dateText = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase();
  printingCaption.textContent = `Fresh off the press. · ${dateText}`;

  if (reducedMotion) {
    printedStripCard.style.transform = 'translateY(0) rotate(-0.5deg)';
    printedStripCard.classList.add('is-reduced-fade', 'is-settled');
    veils.forEach((v) => { v.style.opacity = '0'; });
    printerLed.dataset.state = 'ready';
    printingStatus.textContent = 'READY';
    printingCaption.classList.add('is-visible');
    await new Promise((r) => setTimeout(r, 650));
    return;
  }

  return new Promise((resolve) => {
    let finished = false;
    let rafId = 0;
    let jitterTimer = 0;
    let lastStepIndex = -1;
    let whirrStarted = false;
    let finishTriggered = false;

    const totalMs = PRINT_DURATION_MS;
    const tProcessing = Math.round(totalMs * 0.12); // ~800ms
    const tPrintStart = Math.round(totalMs * 0.24); // ~1600ms
    const tPrintEnd = Math.round(totalMs * 0.90);   // ~5850ms
    const stepSchedule = buildIrregularStepSchedule(tPrintStart, tPrintEnd);

    const cleanup = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      clearInterval(jitterTimer);
      stopPrinterWhirr();
      printerMachine.classList.remove('is-jittering');
      printerMachine.style.transform = '';
      btnSkipPrint.removeEventListener('click', onSkip);
      activeCancel = null;
      resolve();
    };

    const onSkip = () => {
      cleanup();
    };

    activeCancel = cleanup;
    btnSkipPrint.addEventListener('click', onSkip);

    const startTime = performance.now();

    // 60ms interval 1px jitter during active motor phases
    jitterTimer = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      if (elapsed >= tProcessing && elapsed <= tPrintEnd) {
        const jx = (Math.random() - 0.5) * 2;
        const jy = (Math.random() - 0.5) * 2;
        printerMachine.style.transform = `translate(${jx.toFixed(1)}px, ${jy.toFixed(1)}px)`;
      } else {
        printerMachine.style.transform = '';
      }
    }, 60);

    const frame = (now) => {
      if (finished) return;
      const elapsed = now - startTime;

      // Phase 2: Processing beat
      if (elapsed >= tProcessing && !whirrStarted) {
        whirrStarted = true;
        printerSlotGlow.classList.add('is-lit');
        printingStatus.textContent = 'PRINTING STRIP...';
        startPrinterWhirr();
      }

      // Phase 3: Stepped mechanical printing + sequential photo developing
      if (elapsed >= tPrintStart && elapsed <= tPrintEnd) {
        let stepIdx = 0;
        while (stepIdx < stepSchedule.length - 1 && stepSchedule[stepIdx + 1].time <= elapsed) {
          stepIdx++;
        }
        const progress = stepSchedule[stepIdx].progress;

        if (stepIdx !== lastStepIndex) {
          lastStepIndex = stepIdx;
          playPrinterStepTick();
          if (Math.random() < 0.48) {
            spawnDustParticle(dustLayer, appState.edits.themeId);
          }
        }

        const translatePct = -102 + progress * 102;
        const wobbleDeg = Math.sin(progress * Math.PI * 5) * 1.15 * (1 - progress * 0.4);
        const shadowAlpha = (0.08 + progress * 0.22).toFixed(2);
        printedStripCard.style.transform = `translateY(${translatePct.toFixed(2)}%) rotate(${wobbleDeg.toFixed(2)}deg)`;
        printedStripCard.style.boxShadow = `0 ${Math.round(8 + progress * 14)}px ${Math.round(18 + progress * 24)}px -10px rgba(22, 20, 18, ${shadowAlpha})`;

        // Light sweep bar just under the slot
        lightSweep.style.opacity = '0.85';
        lightSweep.style.transform = `translateY(${Math.round(progress * 14)}px)`;

        // Sequential row developing (400-600ms per row)
        const rowWindow = (tPrintEnd - tPrintStart) / Math.max(1, veils.length);
        veils.forEach((veil, idx) => {
          const rowStart = tPrintStart + idx * rowWindow * 0.72;
          const rowProgress = Math.max(0, Math.min(1, (elapsed - rowStart) / 520));
          // Fade from washed-out white veil to clear
          veil.style.opacity = String((1 - rowProgress).toFixed(3));
        });
      }

      // Phase 4: Finish & settle
      if (elapsed >= tPrintEnd && !finishTriggered) {
        finishTriggered = true;
        stopPrinterWhirr();
        playPrintDing();
        printerSlotGlow.classList.remove('is-lit');
        lightSweep.style.opacity = '0';
        veils.forEach((v) => { v.style.opacity = '0'; });
        printerLed.dataset.state = 'ready';
        printingStatus.textContent = 'COMPLETE';
        printedStripCard.style.transform = '';
        printedStripCard.classList.add('is-settled');
        printingCaption.classList.add('is-visible');
      }

      if (elapsed >= totalMs) {
        cleanup();
        return;
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
  });
}

