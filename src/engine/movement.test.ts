import { describe, expect, it } from 'vitest';
import { createInitialState } from './game';
import { applyBackdo, applyMove, planPath } from './movement';
import type { GameState, PieceGroup } from './types';

/** Test-only fixture helper: drops a group directly onto the board, bypassing normal move flow. */
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

describe('planPath', () => {
  it('walks a simple deterministic chain with no branch', () => {
    const result = planPath('p2', 'p1', 3);
    expect(result).toEqual({ status: 'complete', path: ['p3', 'p4', 'p5'], reachesFinish: false });
  });

  it('requests a choice exactly when the walk needs to continue past a branch corner', () => {
    const result = planPath('p2', 'p1', 4);
    expect(result).toEqual({
      status: 'needs-choice',
      pathSoFar: ['p3', 'p4', 'p5'],
      branchNode: 'p5',
      options: ['p6', 'd5a'],
      remainingDistance: 1,
    });
  });

  it('resumes correctly once a branch choice is supplied', () => {
    const result = planPath('p2', 'p1', 4, ['p6']);
    expect(result).toEqual({ status: 'complete', path: ['p3', 'p4', 'p5', 'p6'], reachesFinish: false });
  });
});

describe('applyMove', () => {
  it('places a brand new piece on an empty node', () => {
    const state = createInitialState();
    const outcome = applyMove(state, { type: 'new', pieceId: 'p1-piece-0' }, ['p1', 'p2', 'p3']);

    expect(outcome.catchInfo).toBeNull();
    expect(outcome.stacked).toBe(false);
    expect(outcome.finished).toBe(false);
    expect(outcome.state.groups).toHaveLength(1);
    expect(outcome.state.groups[0].path).toEqual(['p1', 'p2', 'p3']);
    expect(outcome.state.groups[0].memberPieceIds).toEqual(['p1-piece-0']);

    const piece = outcome.state.players[0].pieces.find((p) => p.id === 'p1-piece-0')!;
    expect(piece.status).toBe('onBoard');
    expect(piece.groupId).toBe(outcome.state.groups[0].id);
  });

  it('catches an opponent group landed on, sending it back to waiting and granting an extra throw', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'opp-group', ownerId: 'p2', memberPieceIds: ['p2-piece-0'], path: ['p3'] });

    const outcome = applyMove(state, { type: 'new', pieceId: 'p1-piece-0' }, ['p1', 'p2', 'p3']);

    expect(outcome.catchInfo).toEqual({ caughtGroupId: 'opp-group', caughtOwnerId: 'p2', caughtPieceIds: ['p2-piece-0'] });
    expect(outcome.events).toEqual([
      { type: 'catch', catcherOwnerId: 'p1', caughtOwnerId: 'p2', caughtGroupId: 'opp-group', caughtPieceIds: ['p2-piece-0'] },
    ]);
    expect(outcome.state.groups).toHaveLength(1);
    expect(outcome.state.groups[0].ownerId).toBe('p1');

    const caughtPiece = outcome.state.players[1].pieces.find((p) => p.id === 'p2-piece-0')!;
    expect(caughtPiece.status).toBe('waiting');
    expect(caughtPiece.groupId).toBeNull();
  });

  it('stacks with an own group landed on, merging into one group that moves together', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'own-group', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p3'] });

    const outcome = applyMove(state, { type: 'new', pieceId: 'p1-piece-1' }, ['p1', 'p2', 'p3']);

    expect(outcome.stacked).toBe(true);
    expect(outcome.catchInfo).toBeNull();
    expect(outcome.state.groups).toHaveLength(1);
    expect(outcome.state.groups[0].memberPieceIds.sort()).toEqual(['p1-piece-0', 'p1-piece-1']);
    expect(outcome.state.groups[0].path).toEqual(['p1', 'p2', 'p3']);
  });

  it('marks all members finished and removes the group when the path reaches finish', () => {
    let state = createInitialState();
    state = withGroup(state, {
      id: 'near-end',
      ownerId: 'p1',
      memberPieceIds: ['p1-piece-0', 'p1-piece-1'],
      path: ['p17', 'p18'],
    });

    const outcome = applyMove(state, { type: 'group', groupId: 'near-end' }, ['p19', 'finish']);

    expect(outcome.finished).toBe(true);
    expect(outcome.state.groups).toHaveLength(0);
    const pieces = outcome.state.players[0].pieces.filter((p) => ['p1-piece-0', 'p1-piece-1'].includes(p.id));
    expect(pieces.every((p) => p.status === 'finished')).toBe(true);
    expect(pieces.every((p) => p.groupId === null)).toBe(true);
  });
});

describe('applyBackdo', () => {
  it('retreats a group one node back along its own path history', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'g1', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p1', 'p2', 'p3'] });

    const outcome = applyBackdo(state, 'g1');

    expect(outcome.state.groups).toHaveLength(1);
    expect(outcome.state.groups[0].path).toEqual(['p1', 'p2']);
  });

  it('sends a group all the way back to waiting if it has only ever occupied one node', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'g1', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p1'] });

    const outcome = applyBackdo(state, 'g1');

    expect(outcome.state.groups).toHaveLength(0);
    const piece = outcome.state.players[0].pieces.find((p) => p.id === 'p1-piece-0')!;
    expect(piece.status).toBe('waiting');
    expect(piece.groupId).toBeNull();
  });

  it('can catch an opponent occupying the retreat node', () => {
    let state = createInitialState();
    state = withGroup(state, { id: 'g1', ownerId: 'p1', memberPieceIds: ['p1-piece-0'], path: ['p1', 'p2'] });
    state = withGroup(state, { id: 'opp', ownerId: 'p2', memberPieceIds: ['p2-piece-0'], path: ['p1'] });

    const outcome = applyBackdo(state, 'g1');

    expect(outcome.catchInfo).toEqual({ caughtGroupId: 'opp', caughtOwnerId: 'p2', caughtPieceIds: ['p2-piece-0'] });
    expect(outcome.state.groups).toHaveLength(1);
    expect(outcome.state.groups[0].path).toEqual(['p1']);
  });
});
