import { describe, expect, it } from 'vitest';
import { createInitialState } from './game';
import { beginAssignment, chooseBranch, getLegalAssignments, throwSticks } from './turn';
import type { GameState, PieceGroup } from './types';

/** Queue-based rng: each call pops the next value. Lets tests force exact stick outcomes. */
function queueRng(values: number[]): () => number {
  let i = 0;
  return () => {
    if (i >= values.length) throw new Error('queueRng exhausted');
    return values[i++];
  };
}

const FLAT = 0.1; // < P_FLAT (0.35)
const ROUND = 0.9; // >= P_FLAT

const rngFor = {
  mo: () => queueRng([ROUND, ROUND, ROUND, ROUND]),
  do: () => queueRng([ROUND, FLAT, ROUND, ROUND]),
  gae: () => queueRng([FLAT, FLAT, ROUND, ROUND]),
  geol: () => queueRng([FLAT, FLAT, FLAT, ROUND]),
  yut: () => queueRng([FLAT, FLAT, FLAT, FLAT]),
  backdo: () => queueRng([FLAT, ROUND, ROUND, ROUND]),
};

function withGroup(state: GameState, group: PieceGroup): GameState {
  const idSet = new Set(group.memberPieceIds);
  return {
    ...state,
    groups: [...state.groups, group],
    players: state.players.map((player) => ({
      ...player,
      pieces: player.pieces.map((piece) =>
        idSet.has(piece.id) ? { ...piece, status: 'onBoard' as const, groupId: group.id } : piece,
      ),
    })) as GameState['players'],
  };
}

describe('throwSticks', () => {
  it('a non-bonus result moves phase straight to assigning', () => {
    const state = createInitialState();
    const { state: next, events } = throwSticks(state, rngFor.do());
    expect(next.phase).toBe('assigning');
    expect(next.pending).toHaveLength(1);
    expect(next.pending[0].result.kind).toBe('do');
    expect(events).toEqual([
      { type: 'throw', playerId: 'p1', result: next.pending[0].result, sticks: ['round', 'flat', 'round', 'round'] },
    ]);
  });

  it('chains Yut/Mo bonus throws without moving to assigning until a non-bonus result lands', () => {
    let state = createInitialState();
    ({ state } = throwSticks(state, rngFor.yut()));
    expect(state.phase).toBe('throwing');
    expect(state.pending).toHaveLength(1);

    ({ state } = throwSticks(state, rngFor.mo()));
    expect(state.phase).toBe('throwing');
    expect(state.pending).toHaveLength(2);

    ({ state } = throwSticks(state, rngFor.do()));
    expect(state.phase).toBe('assigning');
    expect(state.pending).toHaveLength(3);
  });

  it('auto-discards an unplayable lone Back-do thrown with no on-board group and ends the turn', () => {
    const state = createInitialState();
    const { state: next, events } = throwSticks(state, rngFor.backdo());

    expect(next.pending).toHaveLength(0);
    expect(next.phase).toBe('throwing');
    expect(next.activePlayer).toBe('p2');
    expect(events.some((e) => e.type === 'no-legal-move')).toBe(true);
    expect(events.some((e) => e.type === 'turn-end')).toBe(true);
  });
});

describe('getLegalAssignments', () => {
  it('offers every waiting piece as a target for a non-backdo result when no groups are on board', () => {
    const state = createInitialState();
    const { state: withPending } = throwSticks(state, rngFor.do());
    const legal = getLegalAssignments(withPending);
    expect(legal).toHaveLength(4);
    expect(legal.every((a) => a.source.type === 'new')).toBe(true);
  });
});

describe('beginAssignment', () => {
  it('commits a simple move with no branch and ends the turn when pending empties out', () => {
    const state = createInitialState();
    const { state: withPending } = throwSticks(state, rngFor.do());
    const legal = getLegalAssignments(withPending);
    const { state: next, events } = beginAssignment(withPending, legal[0].pendingResultId, legal[0].source);

    expect(next.groups).toHaveLength(1);
    expect(next.groups[0].path).toEqual(['p1']);
    expect(next.pending).toHaveLength(0);
    expect(next.phase).toBe('throwing');
    expect(next.activePlayer).toBe('p2');
    expect(events.some((e) => e.type === 'turn-end')).toBe(true);
  });

  it('rejects an assignment that is not in getLegalAssignments', () => {
    const state = createInitialState();
    const { state: withPending } = throwSticks(state, rngFor.do());
    const pendingResultId = withPending.pending[0].id;
    expect(() => beginAssignment(withPending, pendingResultId, { type: 'group', groupId: 'does-not-exist' })).toThrow();
  });

  it('enters branch-choice phase when the move must cross an unresolved branch', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'g1', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p1', 'p2'] });
    state = { ...state, phase: 'assigning', pending: [{ id: 'r1', result: { kind: 'yut', distance: 4, grantsExtraThrow: true } }] };

    const { state: next } = beginAssignment(state, 'r1', { type: 'group', groupId: 'g1' });

    expect(next.phase).toBe('branch-choice');
    expect(next.branchContext).toMatchObject({ branchNode: 'p5', options: ['p6', 'd5a'] });
  });

  it('forces phase back to throwing (mandatory bonus throw) immediately after a catch, without ending the turn', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'opp', ownerId: 'p2', memberPieceIds: ['p2-piece-0'], path: ['p1'] });
    state = { ...state, phase: 'assigning', pending: [{ id: 'r1', result: { kind: 'do', distance: 1, grantsExtraThrow: false } }] };

    const { state: next, events } = beginAssignment(state, 'r1', { type: 'new', pieceId: 'p1-piece-0' });

    expect(next.phase).toBe('throwing');
    expect(next.activePlayer).toBe('p1'); // turn does NOT switch; catcher gets the bonus throw
    expect(events.some((e) => e.type === 'catch')).toBe(true);
    expect(events.some((e) => e.type === 'turn-end')).toBe(false);
  });
});

describe('chooseBranch', () => {
  it('resolves a pending branch and commits the move', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'g1', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p1', 'p2'] });
    state = { ...state, phase: 'assigning', pending: [{ id: 'r1', result: { kind: 'yut', distance: 4, grantsExtraThrow: true } }] };

    let result = beginAssignment(state, 'r1', { type: 'group', groupId: 'g1' });
    result = chooseBranch(result.state, 'd5a');

    expect(result.state.phase).toBe('throwing'); // pending emptied -> turn ends -> back to throwing for p2
    expect(result.state.activePlayer).toBe('p2');
    expect(result.state.groups[0].path).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'd5a']);
  });

  it('rejects a choice that is not one of the offered options', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'g1', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p1', 'p2'] });
    state = { ...state, phase: 'assigning', pending: [{ id: 'r1', result: { kind: 'yut', distance: 4, grantsExtraThrow: true } }] };

    const { state: branchState } = beginAssignment(state, 'r1', { type: 'group', groupId: 'g1' });
    expect(() => chooseBranch(branchState, 'p9' as never)).toThrow();
  });
});

describe('win condition', () => {
  it('declares a winner and enters game-over once all of a player’s pieces finish', () => {
    let state = createInitialState({ piecesPerPlayer: 1 });
    state = withGroup(state, { id: 'g1', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p18'] });
    state = { ...state, phase: 'assigning', pending: [{ id: 'r1', result: { kind: 'geol', distance: 3, grantsExtraThrow: false } }] };

    const { state: next, events } = beginAssignment(state, 'r1', { type: 'group', groupId: 'g1' });

    expect(next.phase).toBe('game-over');
    expect(next.winner).toBe('p1');
    expect(events.some((e) => e.type === 'win')).toBe(true);
  });
});
