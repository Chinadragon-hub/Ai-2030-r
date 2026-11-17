import { PRESENTATION_META, PLAN_ITEMS, TIMELINE } from '../data/timeline.js';
import {
  formatTime,
  getFourSectionProgress,
  getSpeakerDisplay,
} from '../utils/timelineHelpers.js';

/**
 * Escapes HTML special characters safely.
 */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Formats teleprompter line with optional cue highlight or Julia prefix.
 */
function formatLineHtml(line, isJulia) {
  let safe = esc(line);
  // Highlight cue parentheticals such as (Louay: Thank you, Julia!)
  safe = safe.replace(
    /(\([^)]+\))/g,
    '<span class="text-[#FCEE0A] font-bold">$1</span>'
  );
  if (isJulia) {
    return `<span class="text-[#FF2A6D] font-bold glow-magenta mr-2">Julia:</span><span>${safe}</span>`;
  }
  return safe;
}

/**
 * Mounts and manages the semantic DOM HUD layered over the 3D canvas.
 */
export function createPresentationHud(rootEl, handlers) {
  rootEl.innerHTML = `
    <div id="hud-root" class="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between">
      <!-- START SCREEN -->
      <div id="screen-start" class="pointer-events-auto fixed inset-0 flex items-center justify-center p-6 bg-[#0B0C1A]/55">
        <div class="w-full max-w-2xl rounded-2xl bg-[#0B0C1A]/92 border border-[#00F0FF]/40 p-8 md:p-10 shadow-2xl">
          <p class="text-sm font-semibold tracking-widest uppercase text-[#00F0FF] mb-2">
            5-Minute 3D Cinematic Presentation
          </p>
          <h1 class="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white glow-cyan mb-3">
            ${esc(PRESENTATION_META.title)}
          </h1>
          <p class="text-xl text-slate-200 font-medium mb-5">
            ${esc(PRESENTATION_META.subtitle)}
          </p>
          <div class="flex flex-wrap items-center gap-3 text-base text-slate-300 border-t border-white/10 pt-4 mb-7">
            <span class="text-[#00F0FF] font-bold">Louay Kouki</span>
            <span aria-hidden="true" class="text-slate-500">·</span>
            <span class="text-[#FCEE0A] font-bold">Mahmoud Dammek</span>
            <span aria-hidden="true" class="text-slate-500">·</span>
            <span class="text-[#FF2A6D] font-semibold">AI Guide: Julia</span>
          </div>

          <div class="flex flex-wrap items-center gap-4 mb-6">
            <button
              id="btn-start"
              type="button"
              class="px-7 py-3.5 rounded-xl bg-[#00F0FF] text-[#0B0C1A] font-display font-bold text-base tracking-wide hover:bg-[#5ef6ff] transition-colors cursor-pointer"
            >
              Start Presentation
            </button>
            <button
              id="btn-start-pdf"
              type="button"
              class="px-5 py-3.5 rounded-xl bg-[#141933] text-white border border-[#FCEE0A]/60 font-semibold text-base hover:bg-[#1e254a] transition-colors cursor-pointer"
            >
              Download PDF Script
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300 border-t border-white/10 pt-4">
            <label class="inline-flex items-center gap-2.5 cursor-pointer">
              <input id="chk-start-auto" type="checkbox" class="w-4 h-4 accent-[#00F0FF]" />
              <span>Enable Auto Mode (300s timer) instead of Live Presenters pace</span>
            </label>
            <span class="text-slate-400">Controls: Click / Right-Click / ArrowRight Next · H Hide UI</span>
          </div>
        </div>
      </div>

      <!-- ACTIVE TOP CONTROL BAR (COLLAPSIBLE AT TOP) -->
      <div id="hud-topbar-wrap" class="hidden pointer-events-auto w-full">
        <header id="hud-topbar" class="w-full px-5 pt-3 pb-2 bg-[#0B0C1A]/88 border-b border-white/10">
          <div class="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <!-- Title & Scene -->
            <div class="flex items-center gap-3 shrink-0">
              <span class="font-display text-lg font-bold tracking-wider text-[#00F0FF] glow-cyan whitespace-nowrap">
                AI IN 2030
              </span>
              <span aria-hidden="true" class="text-slate-600">/</span>
              <span id="hud-scene-label" class="text-sm font-semibold text-slate-200 whitespace-nowrap truncate max-w-[230px]">
                Smart City Skyline
              </span>
            </div>

            <!-- 4-Section Interactive Progress Bar -->
            <nav id="hud-sections" aria-label="Presentation sections" class="flex-1 min-w-[320px] max-w-2xl grid grid-cols-4 gap-2">
            </nav>

            <!-- Timer & Controls -->
            <div class="flex items-center gap-2 shrink-0">
              <span id="hud-timer" class="font-display text-sm font-semibold text-[#FCEE0A] tabular-nums px-2 whitespace-nowrap">
                00:00 / 05:00
              </span>
              <button id="btn-mode" type="button" class="px-2.5 py-1.5 rounded-lg bg-[#141933] border border-white/15 text-xs font-semibold text-slate-200 hover:border-[#00F0FF] cursor-pointer whitespace-nowrap">
                Mode: Live
              </button>
              <button id="btn-pause" type="button" class="px-2.5 py-1.5 rounded-lg bg-[#141933] border border-white/15 text-xs font-semibold text-slate-200 hover:border-[#00F0FF] cursor-pointer whitespace-nowrap">
                Pause
              </button>
              <button id="btn-mute" type="button" class="px-2.5 py-1.5 rounded-lg bg-[#141933] border border-white/15 text-xs font-semibold text-slate-200 hover:border-[#00F0FF] cursor-pointer whitespace-nowrap">
                Mute
              </button>
              <button id="btn-hide" type="button" class="px-2.5 py-1.5 rounded-lg bg-[#141933] border border-white/15 text-xs font-semibold text-slate-200 hover:border-[#FCEE0A] cursor-pointer whitespace-nowrap">
                Hide (H)
              </button>
              <button id="btn-top-pdf" type="button" class="px-2.5 py-1.5 rounded-lg bg-[#141933] border border-[#FCEE0A]/40 text-xs font-semibold text-[#FCEE0A] hover:bg-[#1e254a] cursor-pointer whitespace-nowrap">
                PDF
              </button>
            </div>
          </div>
        </header>

        <!-- COLLAPSED CLICKABLE TOP BAR (CLICK OR PRESS H TO SHOW BOTH) -->
        <div id="hud-topbar-collapsed" class="hidden pt-2 px-5 flex justify-center">
          <button
            id="btn-restore-top"
            type="button"
            class="inline-flex items-center gap-3 rounded-xl bg-[#0B0C1A]/92 border border-[#00F0FF]/45 px-4 py-1.5 text-xs font-semibold text-[#00F0FF] hover:text-white shadow-xl cursor-pointer"
          >
            <span>Show Controls (H)</span>
            <span aria-hidden="true" class="text-slate-600">·</span>
            <span id="collapsed-top-timer" class="font-display text-[#FCEE0A] tabular-nums">00:00 / 05:00</span>
          </button>
        </div>
      </div>

      <!-- MIDDLE SAFE OVERLAYS (Plan Slide, Patient Scan Callout, Julia Orb) -->
      <div id="hud-mid" class="hidden flex-1 relative max-w-[1400px] w-full mx-auto px-6 py-4">
        <!-- Plan Slide Overlay -->
        <section id="plan-overlay" class="hidden absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-3xl rounded-2xl bg-[#0B0C1A]/90 border border-[#00F0FF]/40 p-6 shadow-2xl">
          <h2 class="font-display text-2xl font-bold text-[#FCEE0A] glow-yellow mb-4">
            Presentation Roadmap
          </h2>
          <div id="plan-items-list" class="grid grid-cols-1 md:grid-cols-2 gap-3"></div>
        </section>

        <!-- Hospital Hologram Patient Scan Callout -->
        <aside id="patient-scan-badge" class="hidden absolute top-4 left-6 rounded-xl bg-[#0B0C1A]/90 border border-[#00F0FF]/55 px-5 py-3.5 shadow-xl">
          <div class="font-display text-sm font-bold text-[#00F0FF] tracking-wide mb-1">
            HOLOGRAM PATIENT SCAN
          </div>
          <div class="text-base font-semibold text-white tabular-nums">
            Scan Time: 3.0s · Confidence: <span class="text-[#FCEE0A]">98%</span>
          </div>
        </aside>

        <!-- Julia Glowing Orb + Sound-Wave Ring (visible ONLY when Julia speaks) -->
        <div id="julia-orb-container" class="hidden absolute top-4 right-6 flex items-center gap-4 rounded-2xl bg-[#0B0C1A]/90 border border-[#FF2A6D]/60 px-5 py-3.5 shadow-2xl">
          <div class="relative w-14 h-14 flex items-center justify-center shrink-0">
            <span class="julia-wave-ring absolute inset-0 rounded-full border-2 border-[#00F0FF]"></span>
            <span class="julia-wave-ring-delay absolute inset-0 rounded-full border-2 border-[#FF2A6D]"></span>
            <div
              class="w-10 h-10 rounded-full shadow-lg"
              style="background: radial-gradient(circle at 35% 35%, #00F0FF 0%, #FF2A6D 68%, #0B0C1A 100%); box-shadow: 0 0 22px rgba(255,42,109,0.75);"
            ></div>
          </div>
          <div>
            <div class="font-display text-sm font-bold tracking-wider text-[#FF2A6D] glow-magenta">
              JULIA - AI Assistant
            </div>
            <div class="flex items-end gap-1 h-4 mt-1.5" aria-hidden="true">
              <span class="julia-eq-bar w-1 h-3 bg-[#00F0FF] rounded-sm" style="animation-delay: 0ms"></span>
              <span class="julia-eq-bar w-1 h-4 bg-[#FF2A6D] rounded-sm" style="animation-delay: 140ms"></span>
              <span class="julia-eq-bar w-1 h-2.5 bg-[#00F0FF] rounded-sm" style="animation-delay: 280ms"></span>
              <span class="julia-eq-bar w-1 h-4 bg-[#FF2A6D] rounded-sm" style="animation-delay: 90ms"></span>
              <span class="julia-eq-bar w-1 h-3 bg-[#00F0FF] rounded-sm" style="animation-delay: 210ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- AUDIENCE-VISIBLE TELEPROMPTER & CONTROLS DOCK (COLLAPSIBLE AT BOTTOM) -->
      <footer id="hud-teleprompter-wrap" class="hidden pointer-events-auto w-full px-5 pb-4">
        <div id="teleprompter-expanded" class="max-w-6xl mx-auto flex flex-col items-center">
          <button
            id="btn-collapse-speech"
            type="button"
            class="px-4 py-1 rounded-t-lg bg-[#0B0C1A]/92 border border-b-0 border-white/15 text-xs font-semibold text-slate-300 hover:text-[#00F0FF] cursor-pointer"
          >
            Hide Speech (H)
          </button>
          <div class="w-full rounded-2xl bg-[#0B0C1A]/92 border border-white/15 px-7 py-5 shadow-2xl">
            <div class="flex items-center justify-between gap-4 mb-2">
              <span id="teleprompter-speaker" class="font-display text-sm font-bold tracking-widest uppercase">
                LOUAY KOUKI
              </span>
              <span id="teleprompter-counter" class="text-sm font-semibold text-slate-400 tabular-nums">
                1 / ${TIMELINE.length}
              </span>
            </div>

            <div id="teleprompter-lines" class="font-body text-[32px] leading-[1.22] font-semibold text-white min-h-[78px] flex flex-col justify-center">
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
              <div class="flex items-center gap-2.5">
                <button id="btn-prev" type="button" class="px-4 py-2 rounded-lg bg-[#141933] border border-white/20 text-sm font-semibold text-white hover:border-[#00F0FF] cursor-pointer whitespace-nowrap">
                  Previous
                </button>
                <button id="btn-next" type="button" class="px-6 py-2 rounded-lg bg-[#00F0FF] text-[#0B0C1A] font-display text-sm font-bold tracking-wide hover:bg-[#66f7ff] cursor-pointer whitespace-nowrap">
                  Next
                </button>
                <button id="btn-skip" type="button" class="px-4 py-2 rounded-lg bg-[#141933] border border-[#FCEE0A]/45 text-sm font-semibold text-[#FCEE0A] hover:bg-[#1e254a] cursor-pointer whitespace-nowrap">
                  Skip Section
                </button>
              </div>
              <div id="teleprompter-hint" class="text-sm text-slate-400">
                Live Presenters Mode · Next, Click or ArrowRight to advance
              </div>
            </div>
          </div>
        </div>

        <!-- COLLAPSED CLICKABLE BOTTOM BAR (CLICK TO SHOW SPEECH AGAIN) -->
        <div id="teleprompter-collapsed" class="hidden max-w-xl mx-auto flex items-center justify-between gap-3 rounded-xl bg-[#0B0C1A]/92 border border-[#00F0FF]/45 px-4 py-2 shadow-xl">
          <button
            id="btn-restore-card"
            type="button"
            class="flex-1 text-left text-sm font-semibold text-[#00F0FF] hover:text-white cursor-pointer truncate"
          >
            Show Speech · <span id="collapsed-speaker-label">LOUAY KOUKI</span>
          </button>
          <div class="flex items-center gap-2 shrink-0">
            <button id="btn-prev-mini" type="button" class="px-3 py-1 rounded-md bg-[#141933] border border-white/15 text-xs font-semibold text-white hover:border-[#00F0FF] cursor-pointer">
              Prev
            </button>
            <button id="btn-next-mini" type="button" class="px-3.5 py-1 rounded-md bg-[#00F0FF] text-[#0B0C1A] font-display text-xs font-bold hover:bg-[#66f7ff] cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </footer>

      <!-- END SCREEN -->
      <div id="screen-end" class="hidden pointer-events-auto fixed inset-0 flex items-center justify-center p-6 bg-[#0B0C1A]/65">
        <div class="w-full max-w-xl rounded-2xl bg-[#0B0C1A]/94 border border-[#FCEE0A]/50 p-9 text-center shadow-2xl">
          <p class="font-display text-sm font-bold tracking-widest uppercase text-[#00F0FF] mb-2">
            AI in 2030
          </p>
          <h2 class="font-display text-5xl font-extrabold text-[#FCEE0A] glow-yellow mb-4">
            Thank You
          </h2>
          <p class="text-2xl font-semibold text-white mb-2">
            <span class="text-[#00F0FF]">Louay Kouki</span>
            <span class="text-slate-500 mx-2">&amp;</span>
            <span class="text-[#FCEE0A]">Mahmoud Dammek</span>
          </p>
          <p class="text-lg text-slate-300 mb-8">
            AI is a tool. Humans decide. See you in 2030!
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <button
              id="btn-replay"
              type="button"
              class="px-7 py-3.5 rounded-xl bg-[#00F0FF] text-[#0B0C1A] font-display font-bold text-base tracking-wide hover:bg-[#5ef6ff] cursor-pointer"
            >
              Replay Presentation
            </button>
            <button
              id="btn-end-pdf"
              type="button"
              class="px-5 py-3.5 rounded-xl bg-[#141933] text-white border border-[#FCEE0A]/60 font-semibold text-base hover:bg-[#1e254a] cursor-pointer"
            >
              Download PDF Script
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const el = {
    startScreen: rootEl.querySelector('#screen-start'),
    endScreen: rootEl.querySelector('#screen-end'),
    topbarWrap: rootEl.querySelector('#hud-topbar-wrap'),
    topbar: rootEl.querySelector('#hud-topbar'),
    topbarCollapsed: rootEl.querySelector('#hud-topbar-collapsed'),
    collapsedTopTimer: rootEl.querySelector('#collapsed-top-timer'),
    mid: rootEl.querySelector('#hud-mid'),
    teleprompterWrap: rootEl.querySelector('#hud-teleprompter-wrap'),
    teleprompterExpanded: rootEl.querySelector('#teleprompter-expanded'),
    teleprompterCollapsed: rootEl.querySelector('#teleprompter-collapsed'),
    collapsedSpeakerLabel: rootEl.querySelector('#collapsed-speaker-label'),
    sceneLabel: rootEl.querySelector('#hud-scene-label'),
    sectionsNav: rootEl.querySelector('#hud-sections'),
    timer: rootEl.querySelector('#hud-timer'),
    modeBtn: rootEl.querySelector('#btn-mode'),
    pauseBtn: rootEl.querySelector('#btn-pause'),
    muteBtn: rootEl.querySelector('#btn-mute'),
    hideBtn: rootEl.querySelector('#btn-hide'),
    planOverlay: rootEl.querySelector('#plan-overlay'),
    planItemsList: rootEl.querySelector('#plan-items-list'),
    patientScanBadge: rootEl.querySelector('#patient-scan-badge'),
    juliaOrb: rootEl.querySelector('#julia-orb-container'),
    speakerTag: rootEl.querySelector('#teleprompter-speaker'),
    counter: rootEl.querySelector('#teleprompter-counter'),
    linesBox: rootEl.querySelector('#teleprompter-lines'),
    hint: rootEl.querySelector('#teleprompter-hint'),
    startAutoChk: rootEl.querySelector('#chk-start-auto'),
  };

  // Wire button events
  rootEl.querySelector('#btn-start').addEventListener('click', () => {
    handlers.onStart(el.startAutoChk.checked);
  });
  rootEl.querySelector('#btn-start-pdf').addEventListener('click', handlers.onDownloadPdf);
  rootEl.querySelector('#btn-top-pdf').addEventListener('click', handlers.onDownloadPdf);
  rootEl.querySelector('#btn-end-pdf').addEventListener('click', handlers.onDownloadPdf);
  rootEl.querySelector('#btn-next').addEventListener('click', handlers.onNext);
  rootEl.querySelector('#btn-prev').addEventListener('click', handlers.onPrev);
  rootEl.querySelector('#btn-next-mini').addEventListener('click', handlers.onNext);
  rootEl.querySelector('#btn-prev-mini').addEventListener('click', handlers.onPrev);
  rootEl.querySelector('#btn-skip').addEventListener('click', handlers.onSkipSection);
  rootEl.querySelector('#btn-mode').addEventListener('click', handlers.onToggleAutoMode);
  rootEl.querySelector('#btn-pause').addEventListener('click', handlers.onTogglePause);
  rootEl.querySelector('#btn-mute').addEventListener('click', handlers.onToggleMute);
  rootEl.querySelector('#btn-hide').addEventListener('click', handlers.onToggleHide);
  rootEl.querySelector('#btn-restore-top').addEventListener('click', handlers.onToggleHide);
  rootEl.querySelector('#btn-collapse-speech').addEventListener('click', handlers.onToggleHide);
  rootEl.querySelector('#btn-restore-card').addEventListener('click', handlers.onToggleHide);
  rootEl.querySelector('#btn-replay').addEventListener('click', handlers.onReplay);

  return {
    render(state) {
      const {
        screen,
        cardIndex,
        card,
        elapsedSec,
        totalSec,
        autoMode,
        paused,
        muted,
        cardHidden,
      } = state;

      document.body.dataset.state = screen;
      document.body.dataset.cardIndex = String(cardIndex);

      el.startScreen.classList.toggle('hidden', screen !== 'start');
      el.endScreen.classList.toggle('hidden', screen !== 'end');

      const active = screen === 'active';
      el.topbarWrap.classList.toggle('hidden', !active);
      el.topbar.classList.toggle('hidden', !active || cardHidden);
      el.topbarCollapsed.classList.toggle('hidden', !active || !cardHidden);
      el.mid.classList.toggle('hidden', !active);
      el.teleprompterWrap.classList.toggle('hidden', !active);
      el.teleprompterExpanded.classList.toggle('hidden', !active || cardHidden);
      el.teleprompterCollapsed.classList.toggle('hidden', !active || !cardHidden);

      if (!active || !card) return;

      const timeStr = `${formatTime(elapsedSec)} / ${formatTime(totalSec)}`;
      el.sceneLabel.textContent = card.sceneLabel;
      el.timer.textContent = timeStr;
      el.collapsedTopTimer.textContent = timeStr;
      el.modeBtn.textContent = autoMode ? 'Mode: Auto' : 'Mode: Live';
      el.pauseBtn.textContent = paused ? 'Resume' : 'Pause';
      el.muteBtn.textContent = muted ? 'Unmute' : 'Mute';
      el.hideBtn.textContent = cardHidden ? 'Show (H)' : 'Hide (H)';

      // 4-section progress bar
      const sections = getFourSectionProgress(cardIndex);
      el.sectionsNav.innerHTML = sections
        .map(
          (sec) => `
          <button
            type="button"
            data-section-id="${sec.id}"
            class="text-left px-2 py-1 rounded-md bg-[#141933]/80 border ${
              sec.active ? 'border-[#00F0FF]' : 'border-white/10'
            } hover:border-[#00F0FF]/80 transition-colors cursor-pointer"
          >
            <div class="text-[11px] font-semibold ${
              sec.active ? 'text-[#00F0FF]' : sec.completed ? 'text-[#FCEE0A]' : 'text-slate-300'
            } truncate mb-1">
              ${esc(sec.shortLabel)}
            </div>
            <div class="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div class="h-full bg-[#00F0FF]" style="width: ${sec.percent}%"></div>
            </div>
          </button>
        `
        )
        .join('');

      el.sectionsNav.querySelectorAll('button[data-section-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          handlers.onJumpSection(btn.getAttribute('data-section-id'));
        });
      });

      // Plan overlay
      el.planOverlay.classList.toggle('hidden', !card.isPlanSlide);
      if (card.isPlanSlide) {
        el.planItemsList.innerHTML = PLAN_ITEMS.map((item) => {
          const isActive = item.index === card.planHighlight;
          return `
            <div class="rounded-xl p-3.5 border ${
              isActive
                ? 'bg-[#172146] border-[#FCEE0A] shadow-lg'
                : 'bg-[#0F142B]/80 border-white/10 opacity-65'
            }">
              <div class="font-display text-sm font-bold ${
                isActive ? 'text-[#FCEE0A]' : 'text-[#00F0FF]'
              }">
                ${esc(item.number)}. ${esc(item.title)}
              </div>
              <div class="text-sm text-slate-200 mt-1">${esc(item.subtitle)}</div>
            </div>
          `;
        }).join('');
      }

      // Patient scan badge
      el.patientScanBadge.classList.toggle('hidden', !card.showPatientScan);

      // Julia orb
      const isJulia = card.speaker === 'julia';
      el.juliaOrb.classList.toggle('hidden', !isJulia);

      // Teleprompter speaker tag & lines
      const spk = getSpeakerDisplay(card.speaker);
      el.speakerTag.textContent = spk.tag;
      el.speakerTag.style.color = spk.colorHex;
      el.collapsedSpeakerLabel.textContent = `${spk.tag} (${cardIndex + 1}/${TIMELINE.length})`;
      el.collapsedSpeakerLabel.style.color = spk.colorHex;
      el.counter.textContent = `${cardIndex + 1} / ${TIMELINE.length}`;

      el.linesBox.innerHTML = card.lines
        .map((line) => `<p class="m-0">${formatLineHtml(line, isJulia)}</p>`)
        .join('');

      el.hint.textContent = autoMode
        ? paused
          ? 'Auto Mode Paused · Press Next or Resume'
          : 'Auto Mode Active · Advancing by timeline timing'
        : 'Live Presenters Mode · Next, Click or ArrowRight to advance';
    },
  };
}
