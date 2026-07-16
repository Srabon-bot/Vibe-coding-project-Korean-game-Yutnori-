import { describe, expect, it } from 'vitest';
import { interpretThrow, P_FLAT, simulateThrow, type RawThrow } from './throw';

function raw(a: 'flat' | 'round', b: 'flat' | 'round', c: 'flat' | 'round', d: 'flat' | 'round'): RawThrow {
  return { sticks: [a, b, c, d] };
}

/** Deterministic PRNG (mulberry32) so distribution tests are reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('interpretThrow', () => {
  it('maps 0 flat sticks to Mo, granting an extra throw', () => {
    expect(interpretThrow(raw('round', 'round', 'round', 'round'))).toEqual({
      kind: 'mo',
      distance: 5,
      grantsExtraThrow: true,
    });
  });

  it('maps 4 flat sticks to Yut, granting an extra throw', () => {
    expect(interpretThrow(raw('flat', 'flat', 'flat', 'flat'))).toEqual({
      kind: 'yut',
      distance: 4,
      grantsExtraThrow: true,
    });
  });

  it('maps 2 and 3 flat sticks to Gae and Geol, no extra throw', () => {
    expect(interpretThrow(raw('flat', 'flat', 'round', 'round'))).toEqual({
      kind: 'gae',
      distance: 2,
      grantsExtraThrow: false,
    });
    expect(interpretThrow(raw('flat', 'flat', 'flat', 'round'))).toEqual({
      kind: 'geol',
      distance: 3,
      grantsExtraThrow: false,
    });
  });

  it('treats a single flat stick as Do unless it is the designated back-do stick', () => {
    expect(interpretThrow(raw('round', 'flat', 'round', 'round'))).toEqual({
      kind: 'do',
      distance: 1,
      grantsExtraThrow: false,
    });
    expect(interpretThrow(raw('round', 'round', 'flat', 'round'))).toEqual({
      kind: 'do',
      distance: 1,
      grantsExtraThrow: false,
    });
  });

  it('treats a single flat stick as Back-do when it is specifically sticks[0]', () => {
    expect(interpretThrow(raw('flat', 'round', 'round', 'round'))).toEqual({
      kind: 'backdo',
      distance: -1,
      grantsExtraThrow: false,
    });
  });

  it('can produce Back-do on a throw regardless of turn position (no first-throw gating)', () => {
    // interpretThrow is stateless w.r.t. turn position by design -- this test simply
    // documents that no such parameter/gate exists.
    const result1 = interpretThrow(raw('flat', 'round', 'round', 'round'));
    const result2 = interpretThrow(raw('flat', 'round', 'round', 'round'));
    expect(result1.kind).toBe('backdo');
    expect(result2.kind).toBe('backdo');
  });
});

describe('simulateThrow + interpretThrow distribution', () => {
  it('roughly matches the expected Binomial(4, P_FLAT) distribution over many trials', () => {
    const rng = mulberry32(42);
    const counts: Record<string, number> = { mo: 0, do: 0, backdo: 0, gae: 0, geol: 0, yut: 0 };
    const trials = 50_000;
    for (let i = 0; i < trials; i++) {
      const result = interpretThrow(simulateThrow(rng));
      counts[result.kind]++;
    }

    const p = P_FLAT;
    const expected = {
      mo: Math.pow(1 - p, 4),
      do: 4 * p * Math.pow(1 - p, 3) * 0.75,
      backdo: 4 * p * Math.pow(1 - p, 3) * 0.25,
      gae: 6 * p * p * Math.pow(1 - p, 2),
      geol: 4 * p * p * p * (1 - p),
      yut: Math.pow(p, 4),
    };

    for (const kind of Object.keys(expected) as Array<keyof typeof expected>) {
      const observed = counts[kind] / trials;
      expect(observed).toBeGreaterThan(expected[kind] - 0.02);
      expect(observed).toBeLessThan(expected[kind] + 0.02);
    }

    // Known trivia the P_FLAT constant is chosen to preserve:
    expect(counts.mo).toBeGreaterThan(counts.geol); // Mo rarer-looking but still beats Geol
    expect(counts.do).toBeGreaterThan(counts.gae * 0.8); // Do stays competitive with Gae
    expect(counts.yut).toBeLessThan(counts.mo); // Yut is the rarest named result
  });
});
