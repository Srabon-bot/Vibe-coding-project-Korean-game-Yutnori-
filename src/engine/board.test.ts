import { describe, expect, it } from 'vitest';
import { getNextStepOptions } from './board';
import { planPath } from './movement';

describe('getNextStepOptions', () => {
  it('disallows the shortcut on a brand new piece leaving start', () => {
    expect(getNextStepOptions('p0', null)).toEqual(['p1']);
  });

  it('routes p0 straight to finish when arrived via the major shortcut', () => {
    expect(getNextStepOptions('p0', 'd0a')).toEqual(['finish']);
  });

  it('branches at a corner reached via the outer perimeter', () => {
    expect(getNextStepOptions('p5', 'p4')).toEqual(['p6', 'd5a']);
    expect(getNextStepOptions('p10', 'p9')).toEqual(['p11', 'd10a']);
    expect(getNextStepOptions('p15', 'p14')).toEqual(['p16', 'd15a']);
  });

  it('does not re-offer a branch when arriving at a corner via its own diagonal', () => {
    expect(getNextStepOptions('p5', 'd5a')).toEqual(['p6']);
    expect(getNextStepOptions('p10', 'd10a')).toEqual(['p11']);
    expect(getNextStepOptions('p15', 'd15a')).toEqual(['p16']);
  });

  it('sends p19 straight to finish', () => {
    expect(getNextStepOptions('p19', 'p18')).toEqual(['finish']);
  });

  it('walks plain perimeter chains deterministically', () => {
    expect(getNextStepOptions('p2', 'p1')).toEqual(['p3']);
    expect(getNextStepOptions('p17', 'p16')).toEqual(['p18']);
  });

  it('outer diagonal nodes pass toward their inner node or corner depending on direction', () => {
    expect(getNextStepOptions('d10a', 'p10')).toEqual(['d10b']);
    expect(getNextStepOptions('d10a', 'd10b')).toEqual(['p10']);
  });

  it('inner diagonal nodes pass toward center or their outer node depending on direction', () => {
    expect(getNextStepOptions('d10b', 'd10a')).toEqual(['center']);
    expect(getNextStepOptions('d10b', 'center')).toEqual(['d10a']);
  });

  it('center exits never regress toward an already-passed corner', () => {
    expect(getNextStepOptions('center', 'd0b')).toEqual(['d5b', 'd10b', 'd15b']);
    expect(getNextStepOptions('center', 'd5b')).toEqual(['d0b', 'd10b', 'd15b']);
    expect(getNextStepOptions('center', 'd10b')).toEqual(['d0b', 'd15b']);
    expect(getNextStepOptions('center', 'd15b')).toEqual(['d0b']);
  });
});

describe('shortcut paths (via planPath)', () => {
  it('walks the major shortcut p10 -> d10a -> d10b -> center -> d0b -> d0a -> p0 -> finish in exactly 7 steps', () => {
    // Two branch choices needed: at p10 (take the diagonal) and at center (exit toward d0b).
    const result = planPath('p10', 'p9', 7, ['d10a', 'd0b']);
    expect(result).toEqual({
      status: 'complete',
      path: ['d10a', 'd10b', 'center', 'd0b', 'd0a', 'p0', 'finish'],
      reachesFinish: true,
    });
  });

  it('walks the minor shortcut p5 -> d5a -> d5b -> center -> d15b -> d15a -> p15 in exactly 6 steps', () => {
    // Two branch choices needed: at p5 (take the diagonal) and at center (exit toward d15b).
    const result = planPath('p5', 'p4', 6, ['d5a', 'd15b']);
    expect(result).toEqual({
      status: 'complete',
      path: ['d5a', 'd5b', 'center', 'd15b', 'd15a', 'p15'],
      reachesFinish: false,
    });
  });

  it('takes the long outer route p10 -> ... -> p19 -> finish when both shortcuts are declined', () => {
    // Declines the shortcut at p10, then again at p15 (also a branch point) before reaching p19.
    const result = planPath('p10', 'p9', 10, ['p11', 'p16']);
    expect(result).toEqual({
      status: 'complete',
      path: ['p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'finish'],
      reachesFinish: true,
    });
  });

  it('stops at finish even if the throw distance overshoots the remaining path', () => {
    const result = planPath('p18', 'p17', 5, []);
    expect(result).toEqual({ status: 'complete', path: ['p19', 'finish'], reachesFinish: true });
  });
});
