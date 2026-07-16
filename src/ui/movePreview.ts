import { planPath } from '../engine/movement';
import {
  currentNode,
  getCameFrom,
  getGroup,
  type BoardNodeId,
  type BranchContext,
  type GameState,
  type LegalAssignment,
  type MoveSource,
  type NodeId,
  type PlayerId,
} from '../engine/types';

/** Where a hovered move choice's source piece currently sits, for anchoring the preview highlight. */
export type PreviewSource = { type: 'waiting'; ownerId: PlayerId; waitingIndex: number } | { type: 'node'; node: BoardNodeId };

export type MovePreview =
  | { kind: 'route'; source: PreviewSource; path: NodeId[]; needsChoice: boolean }
  | { kind: 'leaves-board'; source: PreviewSource };

/** Where a move's source piece currently sits — the waiting tray (for a new piece) or its on-board node. */
function resolvePreviewSource(state: GameState, source: MoveSource): { start: BoardNodeId; cameFrom: BoardNodeId | null; previewSource: PreviewSource } {
  if (source.type === 'new') {
    const owner = state.players.find((p) => p.id === state.activePlayer)!;
    const waitingIndex = owner.pieces.filter((p) => p.status === 'waiting').findIndex((p) => p.id === source.pieceId);
    return {
      start: 'p0',
      cameFrom: null,
      previewSource: { type: 'waiting', ownerId: owner.id, waitingIndex: Math.max(0, waitingIndex) },
    };
  }
  const group = getGroup(state, source.groupId);
  const start = currentNode(group);
  return { start, cameFrom: getCameFrom(group), previewSource: { type: 'node', node: start } };
}

/**
 * Resolves a hovered legal assignment into the path it would take, without mutating game state.
 * Mirrors turn.ts's startMove/applyBackdo branch selection so the preview always matches what
 * actually happens on click. Returns null if the assignment no longer refers to live state
 * (e.g. the pending result was already consumed elsewhere).
 */
export function previewAssignment(state: GameState, assignment: LegalAssignment): MovePreview | null {
  const pending = state.pending.find((p) => p.id === assignment.pendingResultId);
  if (!pending) return null;
  const source = assignment.source;

  if (pending.result.kind === 'backdo') {
    if (source.type !== 'group') return null;
    const group = getGroup(state, source.groupId);
    const previewSource: PreviewSource = { type: 'node', node: currentNode(group) };
    const prev = getCameFrom(group);
    if (prev === null) return { kind: 'leaves-board', source: previewSource };
    return { kind: 'route', source: previewSource, path: [prev], needsChoice: false };
  }

  const { start, cameFrom, previewSource } = resolvePreviewSource(state, source);
  const result = planPath(start, cameFrom, pending.result.distance, []);
  if (result.status === 'needs-choice') {
    return { kind: 'route', source: previewSource, path: [...result.pathSoFar, result.branchNode], needsChoice: true };
  }
  return { kind: 'route', source: previewSource, path: result.path, needsChoice: false };
}

/**
 * Resolves a hovered junction-choice option (from BranchChoiceModal) into the path it would take
 * if picked, replaying the original throw's plan with that choice appended — mirrors turn.ts's
 * chooseBranch so hovering "shortcut" vs. "outer path" previews their actually-different endpoints.
 */
export function previewBranchOption(state: GameState, branchContext: BranchContext, hoveredOption: BoardNodeId): MovePreview {
  const { previewSource } = resolvePreviewSource(state, branchContext.source);
  const result = planPath(branchContext.originalStart, branchContext.originalCameFrom, branchContext.originalDistance, [
    ...branchContext.choicesSoFar,
    hoveredOption,
  ]);
  if (result.status === 'needs-choice') {
    return { kind: 'route', source: previewSource, path: [...result.pathSoFar, result.branchNode], needsChoice: true };
  }
  return { kind: 'route', source: previewSource, path: result.path, needsChoice: false };
}
