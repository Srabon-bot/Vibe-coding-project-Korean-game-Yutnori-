import { getNextStepOptions } from './board';
import {
  getGroup,
  getPiece,
  type BoardNodeId,
  type GameEvent,
  type GameState,
  type MoveSource,
  type NodeId,
  type PieceGroup,
  type PlayerId,
  type Player,
} from './types';

export type PlanPathResult =
  | {
      status: 'needs-choice';
      pathSoFar: BoardNodeId[];
      branchNode: BoardNodeId;
      options: NodeId[];
      remainingDistance: number;
    }
  | { status: 'complete'; path: NodeId[]; reachesFinish: boolean };

/**
 * Walks `distance` steps forward from `start`, resolving branch points using `priorChoices`
 * in order. Returns 'needs-choice' the moment it hits a branch with no choice left to consume,
 * so the caller can re-invoke with an additional choice appended once the player decides.
 * Pure and replay-safe: calling with the same arguments always retraces the same path.
 */
export function planPath(
  start: BoardNodeId,
  cameFrom: BoardNodeId | null,
  distance: number,
  priorChoices: BoardNodeId[] = [],
): PlanPathResult {
  if (distance <= 0) {
    throw new Error('planPath requires a positive distance; back-do is resolved separately');
  }

  const path: NodeId[] = [];
  let currentNode = start;
  let currentCameFrom = cameFrom;
  let choiceIndex = 0;
  let stepsRemaining = distance;

  while (stepsRemaining > 0) {
    const options = getNextStepOptions(currentNode, currentCameFrom);
    let next: NodeId;

    if (options.length > 1) {
      if (choiceIndex < priorChoices.length) {
        next = priorChoices[choiceIndex];
        choiceIndex++;
        if (!options.includes(next)) {
          throw new Error(`Invalid branch choice ${next} at ${currentNode}; options were ${options.join(', ')}`);
        }
      } else {
        return {
          status: 'needs-choice',
          pathSoFar: path as BoardNodeId[],
          branchNode: currentNode,
          options,
          remainingDistance: stepsRemaining,
        };
      }
    } else {
      next = options[0];
    }

    path.push(next);
    if (next === 'finish') {
      return { status: 'complete', path, reachesFinish: true };
    }
    currentCameFrom = currentNode;
    currentNode = next;
    stepsRemaining--;
  }

  return { status: 'complete', path, reachesFinish: false };
}

export interface ApplyMoveOutcome {
  state: GameState;
  events: GameEvent[];
  catchInfo: { caughtGroupId: string; caughtOwnerId: PlayerId; caughtPieceIds: string[] } | null;
  stacked: boolean;
  finished: boolean;
}

const isBoardNodeId = (n: NodeId): n is BoardNodeId => n !== 'finish';

function generateGroupId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function updatePieces(
  players: [Player, Player],
  pieceIds: string[],
  patch: Partial<Pick<import('./types').Piece, 'status' | 'groupId'>>,
): [Player, Player] {
  const idSet = new Set(pieceIds);
  return players.map((player) => ({
    ...player,
    pieces: player.pieces.map((piece) => (idSet.has(piece.id) ? { ...piece, ...patch } : piece)),
  })) as [Player, Player];
}

function findGroupAt(groups: PieceGroup[], node: BoardNodeId): PieceGroup | null {
  return groups.find((g) => g.path[g.path.length - 1] === node) ?? null;
}

/** Shared landing-resolution: handles catching, stacking, and placing on an empty node. */
function commitLanding(
  state: GameState,
  ownerId: PlayerId,
  existingGroupId: string | null,
  memberPieceIds: string[],
  newPath: BoardNodeId[],
): ApplyMoveOutcome {
  const landingNode = newPath[newPath.length - 1];
  const otherGroups = existingGroupId ? state.groups.filter((g) => g.id !== existingGroupId) : state.groups;
  const occupant = findGroupAt(otherGroups, landingNode);

  if (occupant && occupant.ownerId !== ownerId) {
    const remainingGroups = otherGroups.filter((g) => g.id !== occupant.id);
    const newGroupId = existingGroupId ?? generateGroupId();
    const newGroup: PieceGroup = { id: newGroupId, ownerId, memberPieceIds, path: newPath };
    const clearedPlayers = updatePieces(state.players, occupant.memberPieceIds, { status: 'waiting', groupId: null });
    const finalPlayers = updatePieces(clearedPlayers, memberPieceIds, { status: 'onBoard', groupId: newGroupId });
    const newState: GameState = { ...state, players: finalPlayers, groups: [...remainingGroups, newGroup] };
    const events: GameEvent[] = [
      {
        type: 'catch',
        catcherOwnerId: ownerId,
        caughtOwnerId: occupant.ownerId,
        caughtGroupId: occupant.id,
        caughtPieceIds: occupant.memberPieceIds,
      },
    ];
    return {
      state: newState,
      events,
      catchInfo: { caughtGroupId: occupant.id, caughtOwnerId: occupant.ownerId, caughtPieceIds: occupant.memberPieceIds },
      stacked: false,
      finished: false,
    };
  }

  if (occupant && occupant.ownerId === ownerId) {
    const mergedMemberIds = [...occupant.memberPieceIds, ...memberPieceIds];
    const remainingGroups = otherGroups.filter((g) => g.id !== occupant.id);
    const newGroupId = existingGroupId ?? generateGroupId();
    const newGroup: PieceGroup = { id: newGroupId, ownerId, memberPieceIds: mergedMemberIds, path: newPath };
    const finalPlayers = updatePieces(state.players, mergedMemberIds, { status: 'onBoard', groupId: newGroupId });
    const newState: GameState = { ...state, players: finalPlayers, groups: [...remainingGroups, newGroup] };
    return {
      state: newState,
      events: [{ type: 'stack', ownerId, groupId: newGroupId }],
      catchInfo: null,
      stacked: true,
      finished: false,
    };
  }

  const newGroupId = existingGroupId ?? generateGroupId();
  const newGroup: PieceGroup = { id: newGroupId, ownerId, memberPieceIds, path: newPath };
  const finalPlayers = updatePieces(state.players, memberPieceIds, { status: 'onBoard', groupId: newGroupId });
  const newState: GameState = { ...state, players: finalPlayers, groups: [...otherGroups, newGroup] };
  return { state: newState, events: [], catchInfo: null, stacked: false, finished: false };
}

/** Applies a completed forward path (from `planPath`) for either a new piece or an existing group. */
export function applyMove(state: GameState, source: MoveSource, path: NodeId[]): ApplyMoveOutcome {
  let ownerId: PlayerId;
  let memberPieceIds: string[];
  let existingGroupId: string | null = null;
  let priorPath: BoardNodeId[] = [];

  if (source.type === 'new') {
    const piece = getPiece(state, source.pieceId);
    ownerId = piece.ownerId;
    memberPieceIds = [piece.id];
  } else {
    const group = getGroup(state, source.groupId);
    ownerId = group.ownerId;
    memberPieceIds = group.memberPieceIds;
    existingGroupId = group.id;
    priorPath = group.path;
  }

  const final = path[path.length - 1];
  const otherGroups = existingGroupId ? state.groups.filter((g) => g.id !== existingGroupId) : state.groups;

  if (final === 'finish') {
    const finalPlayers = updatePieces(state.players, memberPieceIds, { status: 'finished', groupId: null });
    const newState: GameState = { ...state, players: finalPlayers, groups: otherGroups };
    return {
      state: newState,
      events: [{ type: 'finish', ownerId, groupId: existingGroupId ?? 'new', pieceIds: memberPieceIds }],
      catchInfo: null,
      stacked: false,
      finished: true,
    };
  }

  const newPath = [...priorPath, ...path.filter(isBoardNodeId)];
  return commitLanding(state, ownerId, existingGroupId, memberPieceIds, newPath);
}

/**
 * Applies a back-do move: retreats a group one node along its own path history.
 * If the group has only ever occupied its current node, it leaves the board entirely
 * (returns to `waiting`), since there is nowhere behind it to retreat to.
 */
export function applyBackdo(state: GameState, groupId: string): ApplyMoveOutcome {
  const group = getGroup(state, groupId);
  const newPath = group.path.slice(0, -1);

  if (newPath.length === 0) {
    const finalPlayers = updatePieces(state.players, group.memberPieceIds, { status: 'waiting', groupId: null });
    const newState: GameState = { ...state, players: finalPlayers, groups: state.groups.filter((g) => g.id !== groupId) };
    return { state: newState, events: [], catchInfo: null, stacked: false, finished: false };
  }

  return commitLanding(state, group.ownerId, groupId, group.memberPieceIds, newPath);
}
