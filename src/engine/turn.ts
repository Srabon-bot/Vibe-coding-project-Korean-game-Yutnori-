import { checkWinner } from './game';
import { applyBackdo, applyMove, planPath, type ApplyMoveOutcome } from './movement';
import { interpretThrow, simulateThrow } from './throw';
import {
  currentNode,
  getCameFrom,
  getGroup,
  getPlayer,
  otherPlayer,
  type BoardNodeId,
  type BranchContext,
  type EngineResult,
  type GameEvent,
  type GameState,
  type LegalAssignment,
  type MoveSource,
  type PendingResult,
} from './types';

function generateResultId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `r-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Performs one throw for the active player, appending the result to the pending queue. */
export function throwSticks(state: GameState, rng: () => number = Math.random): EngineResult {
  if (state.phase !== 'throwing') {
    throw new Error(`Cannot throw during phase ${state.phase}`);
  }
  const raw = simulateThrow(rng);
  const result = interpretThrow(raw);
  const pendingResult: PendingResult = { id: generateResultId(), result };
  const events: GameEvent[] = [{ type: 'throw', playerId: state.activePlayer, result, sticks: raw.sticks }];
  const newState: GameState = { ...state, pending: [...state.pending, pendingResult] };

  if (result.grantsExtraThrow) {
    return { state: { ...newState, phase: 'throwing' }, events };
  }
  // Route through the same legality check used after a move commit: this is what catches
  // an unplayable lone Back-do (no on-board group to retreat) thrown at the very start of a turn.
  return finalizeAssigning(newState, events);
}

/** All legal (pendingResult, source) pairs the active player may currently act on. */
export function getLegalAssignments(state: GameState): LegalAssignment[] {
  const player = getPlayer(state, state.activePlayer);
  const ownGroups = state.groups.filter((g) => g.ownerId === player.id);
  const waitingPieces = player.pieces.filter((p) => p.status === 'waiting');

  const assignments: LegalAssignment[] = [];
  for (const pending of state.pending) {
    for (const group of ownGroups) {
      assignments.push({ pendingResultId: pending.id, source: { type: 'group', groupId: group.id } });
    }
    if (pending.result.kind !== 'backdo') {
      for (const piece of waitingPieces) {
        assignments.push({ pendingResultId: pending.id, source: { type: 'new', pieceId: piece.id } });
      }
    }
  }
  return assignments;
}

function sourcesEqual(a: MoveSource, b: MoveSource): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'group' && b.type === 'group') return a.groupId === b.groupId;
  if (a.type === 'new' && b.type === 'new') return a.pieceId === b.pieceId;
  return false;
}

function afterCommit(state: GameState, pendingResultId: string, outcome: ApplyMoveOutcome): EngineResult {
  const pending = state.pending.filter((p) => p.id !== pendingResultId);
  let newState: GameState = { ...state, pending, branchContext: null };
  const events = [...outcome.events];

  if (outcome.catchInfo) {
    newState = { ...newState, phase: 'throwing' };
    return { state: newState, events };
  }

  return finalizeAssigning(newState, events);
}

function finalizeAssigning(state: GameState, events: GameEvent[]): EngineResult {
  if (state.pending.length === 0) {
    return endTurnOrWin(state, events);
  }
  const legal = getLegalAssignments(state);
  if (legal.length > 0) {
    return { state: { ...state, phase: 'assigning' }, events };
  }
  const discardedIds = state.pending.map((p) => p.id);
  const clearedState: GameState = { ...state, pending: [] };
  return endTurnOrWin(clearedState, [...events, { type: 'no-legal-move', discardedResultIds: discardedIds }]);
}

function endTurnOrWin(state: GameState, events: GameEvent[]): EngineResult {
  const winner = checkWinner(state);
  if (winner) {
    return { state: { ...state, phase: 'game-over', winner }, events: [...events, { type: 'win', winnerId: winner }] };
  }
  const nextPlayer = otherPlayer(state.activePlayer);
  const newState: GameState = { ...state, activePlayer: nextPlayer, phase: 'throwing' };
  return { state: newState, events: [...events, { type: 'turn-end', nextPlayer }] };
}

function startMove(state: GameState, pendingResultId: string, source: MoveSource): EngineResult {
  const pending = state.pending.find((p) => p.id === pendingResultId);
  if (!pending) throw new Error(`Unknown pending result ${pendingResultId}`);

  if (pending.result.kind === 'backdo') {
    if (source.type !== 'group') throw new Error('Back-do requires an on-board group');
    const outcome = applyBackdo(state, source.groupId);
    return afterCommit(outcome.state, pendingResultId, outcome);
  }

  let start: BoardNodeId;
  let cameFrom: BoardNodeId | null;
  if (source.type === 'new') {
    start = 'p0';
    cameFrom = null;
  } else {
    const group = getGroup(state, source.groupId);
    start = currentNode(group);
    cameFrom = getCameFrom(group);
  }

  const planResult = planPath(start, cameFrom, pending.result.distance, []);
  if (planResult.status === 'needs-choice') {
    const branchContext: BranchContext = {
      pendingResultId,
      source,
      originalStart: start,
      originalCameFrom: cameFrom,
      originalDistance: pending.result.distance,
      choicesSoFar: [],
      branchNode: planResult.branchNode,
      options: planResult.options,
    };
    return { state: { ...state, phase: 'branch-choice', branchContext }, events: [] };
  }

  const outcome = applyMove(state, source, planResult.path);
  return afterCommit(outcome.state, pendingResultId, outcome);
}

/** Assigns a pending throw result to a piece/group. Must be one of getLegalAssignments(state). */
export function beginAssignment(state: GameState, pendingResultId: string, source: MoveSource): EngineResult {
  if (state.phase !== 'assigning') {
    throw new Error(`Cannot assign a move during phase ${state.phase}`);
  }
  const legal = getLegalAssignments(state);
  const isLegal = legal.some((a) => a.pendingResultId === pendingResultId && sourcesEqual(a.source, source));
  if (!isLegal) throw new Error('Illegal assignment');
  return startMove(state, pendingResultId, source);
}

/** Resolves one branch decision (outer path vs. shortcut) for the in-progress move. */
export function chooseBranch(state: GameState, chosenNode: BoardNodeId): EngineResult {
  if (state.phase !== 'branch-choice' || !state.branchContext) {
    throw new Error('No branch choice is pending');
  }
  const bc = state.branchContext;
  if (!bc.options.includes(chosenNode)) {
    throw new Error(`${chosenNode} is not a valid choice at ${bc.branchNode}`);
  }
  const newChoices = [...bc.choicesSoFar, chosenNode];
  const planResult = planPath(bc.originalStart, bc.originalCameFrom, bc.originalDistance, newChoices);

  if (planResult.status === 'needs-choice') {
    const newBranchContext: BranchContext = {
      ...bc,
      choicesSoFar: newChoices,
      branchNode: planResult.branchNode,
      options: planResult.options,
    };
    return { state: { ...state, branchContext: newBranchContext }, events: [] };
  }

  const outcome = applyMove(state, bc.source, planResult.path);
  return afterCommit(outcome.state, bc.pendingResultId, outcome);
}
