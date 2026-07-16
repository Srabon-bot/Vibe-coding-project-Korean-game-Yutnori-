import { isDiagonalArm } from '../engine/board';
import { currentNode, type BoardNodeId, type GameState, type LegalAssignment, type ThrowKind, type ThrowResult } from '../engine/types';

export const KIND_LABEL: Record<ThrowKind, string> = {
  do: 'Do',
  gae: 'Gae',
  geol: 'Geol',
  yut: 'Yut',
  mo: 'Mo',
  backdo: 'Back-do',
};

export const KIND_DISTANCE: Record<ThrowKind, string> = {
  do: '1 space',
  gae: '2 spaces',
  geol: '3 spaces',
  yut: '4 spaces + extra throw',
  mo: '5 spaces + extra throw',
  backdo: '1 space back',
};

/** Plain-language description of where a piece currently sits, for the move-choice list. */
export function describePiecePosition(node: BoardNodeId | null): string {
  if (node === null) return 'Start';
  if (node === 'center') return 'Center';
  if (isDiagonalArm(node)) return 'On the shortcut';
  return `Outer ${node.slice(1)}/20`;
}

/** "{Kind} · move N steps[ back]" header for a group of move choices sharing one pending result. */
export function describeThrowHeader(result: ThrowResult): string {
  const steps = Math.abs(result.distance);
  const noun = steps === 1 ? 'step' : 'steps';
  const backSuffix = result.distance < 0 ? ' back' : '';
  return `${KIND_LABEL[result.kind]} · move ${steps} ${noun}${backSuffix}`;
}

/** Piece number (stable slot index 1-4, not waiting-list order) and current position, split for card-style display. */
export function describeAssignmentParts(state: GameState, assignment: LegalAssignment): { pieceLabel: string; positionLabel: string } {
  const owner = state.players.find((p) => p.id === state.activePlayer)!;
  const source = assignment.source;

  if (source.type === 'new') {
    const slot = owner.pieces.findIndex((p) => p.id === source.pieceId);
    return { pieceLabel: `Piece ${slot + 1}`, positionLabel: describePiecePosition(null) };
  }

  const group = state.groups.find((g) => g.id === source.groupId)!;
  const slot = owner.pieces.findIndex((p) => p.id === group.memberPieceIds[0]);
  const stackSuffix = group.memberPieceIds.length > 1 ? ` (+${group.memberPieceIds.length - 1})` : '';
  return { pieceLabel: `Piece ${slot + 1}${stackSuffix}`, positionLabel: describePiecePosition(currentNode(group)) };
}

/** "Piece {n}[ (+k)] · {position}" — single-string form of describeAssignmentParts. */
export function describeSource(state: GameState, assignment: LegalAssignment): string {
  const { pieceLabel, positionLabel } = describeAssignmentParts(state, assignment);
  return `${pieceLabel} · ${positionLabel}`;
}
