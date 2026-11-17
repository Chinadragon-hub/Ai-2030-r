import { SECTIONS, TIMELINE } from '../data/timeline.js';

/**
 * Formats seconds as MM:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Precomputes start and end timestamps (in seconds) for every timeline card.
 * @param {typeof TIMELINE} items
 */
export function computeCardTimings(items = TIMELINE) {
  let cursor = 0;
  return items.map((card, index) => {
    const startSec = cursor;
    const endSec = cursor + card.durationSec;
    cursor = endSec;
    return {
      ...card,
      index,
      startSec,
      endSec,
      timeFormatted: formatTime(startSec),
    };
  });
}

/**
 * Computes total duration of the presentation in seconds.
 * @param {typeof TIMELINE} items
 */
export function getTotalDuration(items = TIMELINE) {
  return items.reduce((sum, item) => sum + item.durationSec, 0);
}

/**
 * Returns the next card index, or 'end' when advancing past the last card.
 * @param {number} currentIndex
 * @param {number} totalCount
 * @returns {number | 'end'}
 */
export function getNextCardTarget(currentIndex, totalCount = TIMELINE.length) {
  if (currentIndex + 1 >= totalCount) {
    return 'end';
  }
  return currentIndex + 1;
}

/**
 * Returns the previous card index, clamped at 0.
 * @param {number} currentIndex
 * @returns {number}
 */
export function getPrevCardIndex(currentIndex) {
  return Math.max(0, currentIndex - 1);
}

/**
 * Returns the first card index belonging to the next section, or 'end' if already in final section.
 * @param {number} currentIndex
 * @param {typeof TIMELINE} items
 * @returns {number | 'end'}
 */
export function getSkipSectionTarget(currentIndex, items = TIMELINE) {
  const current = items[currentIndex];
  if (!current) return 0;

  const sectionOrder = SECTIONS.map((s) => s.id);
  const currentSecPos = sectionOrder.indexOf(current.sectionId);
  if (currentSecPos === -1 || currentSecPos + 1 >= sectionOrder.length) {
    return 'end';
  }

  const nextSectionId = sectionOrder[currentSecPos + 1];
  const targetIdx = items.findIndex((c) => c.sectionId === nextSectionId);
  return targetIdx === -1 ? 'end' : targetIdx;
}

/**
 * Returns the first card index for a given section ID.
 * @param {string} sectionId
 * @param {typeof TIMELINE} items
 * @returns {number}
 */
export function getSectionStartIndex(sectionId, items = TIMELINE) {
  const idx = items.findIndex((c) => c.sectionId === sectionId);
  return idx === -1 ? 0 : idx;
}

/**
 * Computes completion percentage (0..100) for each of the 4 progress-bar sections.
 * @param {number} currentIndex
 * @param {typeof TIMELINE} items
 */
export function getFourSectionProgress(currentIndex, items = TIMELINE) {
  const progressSections = SECTIONS.filter((s) => s.inProgressBar);
  const currentCard = items[currentIndex] || items[0];
  const currentOrder = SECTIONS.findIndex((s) => s.id === currentCard.sectionId);

  return progressSections.map((sec) => {
    const secOrder = SECTIONS.findIndex((s) => s.id === sec.id);
    const indices = [];
    items.forEach((item, idx) => {
      if (item.sectionId === sec.id) indices.push(idx);
    });

    if (indices.length === 0) {
      return { ...sec, percent: 0, active: false, completed: false };
    }

    const firstIdx = indices[0];
    const lastIdx = indices[indices.length - 1];

    if (currentOrder < secOrder) {
      return { ...sec, percent: 0, active: false, completed: false };
    }
    if (currentOrder > secOrder) {
      return { ...sec, percent: 100, active: false, completed: true };
    }

    const span = Math.max(1, lastIdx - firstIdx + 1);
    const step = currentIndex - firstIdx + 1;
    const percent = Math.round((step / span) * 100);
    return { ...sec, percent, active: true, completed: false };
  });
}

/**
 * Maps speaker ID to display tag and color key.
 * @param {'louay' | 'mahmoud' | 'julia'} speaker
 */
export function getSpeakerDisplay(speaker) {
  switch (speaker) {
    case 'louay':
      return {
        tag: 'LOUAY KOUKI',
        pdfName: 'Louay Kouki',
        colorHex: '#00F0FF',
        role: 'Presenter',
      };
    case 'mahmoud':
      return {
        tag: 'MAHMOUD DAMMEK',
        pdfName: 'Mahmoud Dammek',
        colorHex: '#FCEE0A',
        role: 'Presenter',
      };
    case 'julia':
    default:
      return {
        tag: 'JULIA - AI Assistant',
        pdfName: 'Julia (AI)',
        colorHex: '#FF2A6D',
        role: 'AI Guide',
      };
  }
}
