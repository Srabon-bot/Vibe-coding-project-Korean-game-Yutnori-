export type SoundKind =
  | 'throw'
  | 'catch'
  | 'stack'
  | 'finish'
  | 'win'
  | 'click'
  | 'toggle'
  | 'open'
  | 'close'
  | 'select'
  | 'error'
  | 'shortcut';

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(audioCtx: AudioContext, startTime: number, freq: number, duration: number, gain: number, type: OscillatorType = 'sine') {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/** Pitch-sliding tone — used for the small percussive "wood block" taps (janggu/buk-flavored UI clicks). */
function slideTone(
  audioCtx: AudioContext,
  startTime: number,
  freqFrom: number,
  freqTo: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'triangle',
) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, startTime);
  osc.frequency.exponentialRampToValueAtTime(freqTo, startTime + duration);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

const RECIPES: Record<SoundKind, (audioCtx: AudioContext) => void> = {
  click: (audioCtx) => tone(audioCtx, audioCtx.currentTime, 520, 0.06, 0.12, 'triangle'),
  throw: (audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, now, 180, 0.12, 0.18, 'square');
    tone(audioCtx, now + 0.06, 220, 0.1, 0.14, 'square');
  },
  catch: (audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, now, 620, 0.09, 0.2, 'sawtooth');
    tone(audioCtx, now + 0.09, 420, 0.14, 0.2, 'sawtooth');
  },
  stack: (audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, now, 440, 0.1, 0.16, 'sine');
    tone(audioCtx, now + 0.08, 660, 0.14, 0.16, 'sine');
  },
  finish: (audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, now, 523.25, 0.12, 0.18, 'triangle');
    tone(audioCtx, now + 0.1, 659.25, 0.12, 0.18, 'triangle');
    tone(audioCtx, now + 0.2, 783.99, 0.2, 0.18, 'triangle');
  },
  win: (audioCtx) => {
    const now = audioCtx.currentTime;
    // Bright fanfare, then a soft low gong swell — a small nod to a ceremonial Korean gong (kkwaenggwari).
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => tone(audioCtx, now + i * 0.14, freq, 0.35, 0.2, 'triangle'));
    tone(audioCtx, now + 0.5, 130.81, 1.1, 0.14, 'sine');
    tone(audioCtx, now + 0.5, 196, 1.1, 0.08, 'sine');
  },
  // Short, dry wood-block-style tap for everyday button presses.
  toggle: (audioCtx) => {
    const now = audioCtx.currentTime;
    slideTone(audioCtx, now, 720, 480, 0.07, 0.14, 'square');
  },
  // Soft rising sweep — a panel/modal opening.
  open: (audioCtx) => {
    const now = audioCtx.currentTime;
    slideTone(audioCtx, now, 380, 700, 0.16, 0.13, 'sine');
  },
  // Soft falling sweep — a panel/modal closing.
  close: (audioCtx) => {
    const now = audioCtx.currentTime;
    slideTone(audioCtx, now, 620, 320, 0.14, 0.12, 'sine');
  },
  // Bright confirm "pluck" for a deliberate choice (a move, a preset, a branch option).
  select: (audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, now, 784, 0.08, 0.16, 'triangle');
    tone(audioCtx, now + 0.05, 987.77, 0.12, 0.14, 'triangle');
  },
  // Low dissonant buzz for a rejected action (bad file, invalid choice).
  error: (audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, now, 180, 0.16, 0.16, 'sawtooth');
    tone(audioCtx, now + 0.09, 150, 0.18, 0.16, 'sawtooth');
  },
  // Small bell-like chime marking the shortcut-junction moment.
  shortcut: (audioCtx) => {
    const now = audioCtx.currentTime;
    tone(audioCtx, now, 880, 0.18, 0.15, 'triangle');
    tone(audioCtx, now + 0.1, 1174.66, 0.22, 0.13, 'triangle');
  },
};

export function playSound(kind: SoundKind): void {
  if (muted) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  RECIPES[kind](audioCtx);
}
