import type { Face, ThrowResult } from './types';

/**
 * Probability a single stick lands flat-side-up. Real yut sticks favor round-up (flat is
 * less stable), so this is kept below 0.4 to preserve Do > Gae and reproduce the well-known
 * trivia that Mo is rarer than Do/Gae but still more common than Geol.
 */
export const P_FLAT = 0.35;

export interface RawThrow {
  /** sticks[0] is the designated back-do stick; the other three are interchangeable. */
  sticks: [Face, Face, Face, Face];
}

function flipStick(rng: () => number): Face {
  return rng() < P_FLAT ? 'flat' : 'round';
}

export function simulateThrow(rng: () => number = Math.random): RawThrow {
  return { sticks: [flipStick(rng), flipStick(rng), flipStick(rng), flipStick(rng)] };
}

const RESULT_BY_FLAT_COUNT: Record<number, Omit<ThrowResult, 'kind'> & { kind: Exclude<ThrowResult['kind'], 'backdo'> }> = {
  0: { kind: 'mo', distance: 5, grantsExtraThrow: true },
  1: { kind: 'do', distance: 1, grantsExtraThrow: false },
  2: { kind: 'gae', distance: 2, grantsExtraThrow: false },
  3: { kind: 'geol', distance: 3, grantsExtraThrow: false },
  4: { kind: 'yut', distance: 4, grantsExtraThrow: true },
};

/**
 * Back-do is a sub-case of the "exactly one stick flat" bucket: it occurs whenever that one
 * flat stick is specifically the designated back-do stick (sticks[0]). Can occur on any throw
 * within a turn, including bonus throws earned from Yut/Mo.
 */
export function interpretThrow(raw: RawThrow): ThrowResult {
  const flatCount = raw.sticks.filter((f) => f === 'flat').length;
  if (flatCount === 1 && raw.sticks[0] === 'flat') {
    return { kind: 'backdo', distance: -1, grantsExtraThrow: false };
  }
  return { ...RESULT_BY_FLAT_COUNT[flatCount] };
}

export function throwSticksRaw(rng: () => number = Math.random): ThrowResult {
  return interpretThrow(simulateThrow(rng));
}
