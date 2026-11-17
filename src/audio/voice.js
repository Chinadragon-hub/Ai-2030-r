/**
 * Browser Web Speech API voice controller for Julia (AI Assistant ONLY).
 * Uses a smooth, calm female English voice with subtle AI poise.
 * Presenters Louay Kouki and Mahmoud Dammek speak live in person.
 */

const PREFERRED_FEMALE_NAMES = [
  'aria',
  'jenny',
  'sonia',
  'libby',
  'natural',
  'google uk english female',
  'google us english',
  'samantha',
  'victoria',
  'karen',
  'ava',
  'allison',
  'serena',
  'tessa',
  'moira',
  'fiona',
  'catherine',
  'kate',
  'susan',
  'hazel',
  'zira',
  'female',
  'woman',
];

const KNOWN_MALE_NAMES = [
  'david',
  'mark',
  'daniel',
  'george',
  'alex',
  'fred',
  'arthur',
  'ryan',
  'guy',
  'james',
  'richard',
  'thomas',
  'oliver',
  'paul',
  'christopher',
  'eric',
  'male',
];

let cachedVoice = null;
let hasDedicatedFemale = false;

function isKnownMale(voiceName) {
  const lower = voiceName.toLowerCase();
  if (lower.includes('female')) return false;
  return KNOWN_MALE_NAMES.some((m) => lower.includes(m));
}

function selectJuliaVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  const englishVoices = voices.filter((v) =>
    (v.lang || '').toLowerCase().startsWith('en')
  );
  const pool = englishVoices.length > 0 ? englishVoices : voices;
  const nonMalePool = pool.filter((v) => !isKnownMale(v.name || ''));
  const candidatePool = nonMalePool.length > 0 ? nonMalePool : pool;

  for (const hint of PREFERRED_FEMALE_NAMES) {
    const match = candidatePool.find((v) =>
      (v.name || '').toLowerCase().includes(hint)
    );
    if (match) {
      hasDedicatedFemale = true;
      cachedVoice = match;
      return match;
    }
  }

  hasDedicatedFemale =
    nonMalePool.length > 0 && !isKnownMale(candidatePool[0]?.name || '');
  cachedVoice = candidatePool[0] || null;
  return cachedVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  selectJuliaVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    selectJuliaVoice();
  };
}

/**
 * Stops any ongoing Julia speech immediately.
 */
export function stopJuliaSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore errors in unsupported browsers
  }
}

/**
 * Speaks Julia's line smoothly in a single continuous utterance using a calm female English voice.
 * @param {string} text
 * @param {boolean} muted
 * @param {() => void} [onEnd]
 */
export function speakJulia(text, muted, onEnd) {
  stopJuliaSpeech();
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    const voice = selectJuliaVoice() || cachedVoice;
    const utterance = new SpeechSynthesisUtterance(String(text).trim());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    } else {
      utterance.lang = 'en-US';
    }

    // Smooth, natural calm female AI cadence without choppy pauses
    utterance.rate = 0.98;
    utterance.pitch = hasDedicatedFemale ? 1.08 : 1.26;
    utterance.volume = 0.95;

    if (typeof onEnd === 'function') {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful no-op if speech synthesis fails
  }
}
