import './index.css';
import { TIMELINE } from './data/timeline.js';
import {
  computeCardTimings,
  getTotalDuration,
  getNextCardTarget,
  getPrevCardIndex,
  getSkipSectionTarget,
  getSectionStartIndex,
} from './utils/timelineHelpers.js';
import { createStage } from './three/stageManager.js';
import { createPresentationHud } from './ui/presentationHud.js';
import { soundEngine } from './audio/soundEffects.js';
import { speakJulia, stopJuliaSpeech } from './audio/voice.js';
import { downloadScriptPdf } from './pdf/pdfGenerator.js';

const timedCards = computeCardTimings(TIMELINE);
const totalSec = getTotalDuration(TIMELINE);

const appRoot = document.getElementById('app');
appRoot.innerHTML = `
  <div id="canvas-mount" data-testid="webgl-mount" class="fixed inset-0 w-full h-full"></div>
  <div id="hud-mount"></div>
`;

const canvasMount = document.getElementById('canvas-mount');
const hudMount = document.getElementById('hud-mount');

const urlParams = new URLSearchParams(window.location.search);
const autoStartParam = urlParams.get('autostart') === '1';

const state = {
  screen: autoStartParam ? 'active' : 'start', // 'start' | 'active' | 'end'
  cardIndex: 0,
  elapsedSec: 0,
  totalSec,
  autoMode: false,
  paused: false,
  muted: false,
  cardHidden: false,
};

const stage = createStage(canvasMount, timedCards[0]);

let autoTimerId = 0;

function clearAutoTimer() {
  if (autoTimerId) {
    window.clearInterval(autoTimerId);
    autoTimerId = 0;
  }
}

let cardElapsedSec = 0;

function syncAutoTimer() {
  clearAutoTimer();
  if (state.screen !== 'active' || !state.autoMode || state.paused) {
    return;
  }
  autoTimerId = window.setInterval(() => {
    const currentCard = timedCards[state.cardIndex];
    cardElapsedSec += 0.25;
    state.elapsedSec = Math.min(totalSec, currentCard.startSec + cardElapsedSec);
    if (cardElapsedSec >= currentCard.durationSec) {
      goToNext();
    } else {
      hud.render(getHudPayload());
    }
  }, 250);
}

function getHudPayload() {
  return {
    ...state,
    card: timedCards[state.cardIndex],
  };
}

function enterCard(index, { instantCamera = false, silent = false, introDrop = false } = {}) {
  state.cardIndex = index;
  cardElapsedSec = 0;
  const card = timedCards[index];
  state.elapsedSec = card.startSec;

  stopJuliaSpeech();
  if (introDrop && typeof stage.playIntroDrop === 'function') {
    stage.playIntroDrop(card);
  } else {
    stage.setCard(card, instantCamera);
  }

  if (!silent) {
    soundEngine.playWhoosh();
  }

  if (card.speaker === 'julia' && state.screen === 'active') {
    if (!silent) {
      soundEngine.playJuliaChime();
    }
    speakJulia(card.lines.join(' '), state.muted);
  }

  hud.render(getHudPayload());
  syncAutoTimer();
}

function goToEnd() {
  clearAutoTimer();
  stopJuliaSpeech();
  state.screen = 'end';
  state.elapsedSec = totalSec;
  soundEngine.playJuliaChime();
  hud.render(getHudPayload());
}

function goToNext() {
  soundEngine.unlock();
  soundEngine.playClick();
  const target = getNextCardTarget(state.cardIndex, timedCards.length);
  if (target === 'end') {
    goToEnd();
  } else {
    enterCard(target);
  }
}

function goToPrev() {
  soundEngine.unlock();
  soundEngine.playClick();
  const target = getPrevCardIndex(state.cardIndex);
  enterCard(target);
}

function skipSection() {
  soundEngine.unlock();
  soundEngine.playClick();
  const target = getSkipSectionTarget(state.cardIndex, timedCards);
  if (target === 'end') {
    goToEnd();
  } else {
    enterCard(target);
  }
}

const hud = createPresentationHud(hudMount, {
  onStart(enableAuto) {
    soundEngine.unlock();
    soundEngine.playClick();
    soundEngine.playWhoosh();
    state.screen = 'active';
    state.autoMode = Boolean(enableAuto);
    state.paused = false;
    state.cardHidden = false;
    enterCard(0, { introDrop: true, silent: true });
  },
  onNext: goToNext,
  onPrev: goToPrev,
  onSkipSection: skipSection,
  onJumpSection(sectionId) {
    soundEngine.unlock();
    soundEngine.playClick();
    const idx = getSectionStartIndex(sectionId, timedCards);
    enterCard(idx);
  },
  onToggleAutoMode() {
    soundEngine.unlock();
    soundEngine.playClick();
    state.autoMode = !state.autoMode;
    hud.render(getHudPayload());
    syncAutoTimer();
  },
  onTogglePause() {
    soundEngine.unlock();
    soundEngine.playClick();
    state.paused = !state.paused;
    stage.setPaused(state.paused);
    if (state.paused) {
      stopJuliaSpeech();
    }
    hud.render(getHudPayload());
    syncAutoTimer();
  },
  onToggleMute() {
    soundEngine.unlock();
    state.muted = !state.muted;
    soundEngine.setMuted(state.muted);
    if (state.muted) {
      stopJuliaSpeech();
    } else {
      soundEngine.playClick();
    }
    hud.render(getHudPayload());
  },
  onToggleHide() {
    soundEngine.unlock();
    soundEngine.playClick();
    state.cardHidden = !state.cardHidden;
    hud.render(getHudPayload());
  },
  onDownloadPdf() {
    soundEngine.unlock();
    soundEngine.playClick();
    downloadScriptPdf();
  },
  onReplay() {
    soundEngine.unlock();
    soundEngine.playClick();
    soundEngine.playWhoosh();
    state.screen = 'active';
    state.paused = false;
    state.cardHidden = false;
    enterCard(0, { introDrop: true, silent: true });
  },
});

// Keyboard controls for live presenters
window.addEventListener('keydown', (e) => {
  if (state.screen !== 'active') return;
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    goToNext();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goToPrev();
  } else if (e.key === 'h' || e.key === 'H') {
    e.preventDefault();
    state.cardHidden = !state.cardHidden;
    hud.render(getHudPayload());
  } else if (e.key === 'm' || e.key === 'M') {
    e.preventDefault();
    state.muted = !state.muted;
    soundEngine.setMuted(state.muted);
    if (state.muted) stopJuliaSpeech();
    hud.render(getHudPayload());
  } else if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    state.paused = !state.paused;
    stage.setPaused(state.paused);
    if (state.paused) stopJuliaSpeech();
    hud.render(getHudPayload());
    syncAutoTimer();
  }
});

// Left-click anywhere on the 3D presentation stage (outside controls) advances to Next
window.addEventListener('click', (e) => {
  if (state.screen !== 'active' || e.button !== 0) return;
  const target = e.target;
  if (
    target instanceof Element &&
    target.closest(
      'button, a, input, label, select, textarea, #hud-topbar-wrap, #teleprompter-collapsed'
    )
  ) {
    return;
  }
  goToNext();
});

// Right-click on mouse advances to Next slide during active presentation
window.addEventListener('contextmenu', (e) => {
  if (state.screen !== 'active') return;
  e.preventDefault();
  goToNext();
});

// Initial render
if (autoStartParam) {
  enterCard(0, { introDrop: true, silent: true });
} else {
  hud.render(getHudPayload());
}

window.addEventListener('beforeunload', () => {
  clearAutoTimer();
  stopJuliaSpeech();
  stage.dispose();
});
