import { isDiagonalArm } from '../engine/board';
import { currentNode, type BoardNodeId, type GameState, type LegalAssignment, type ThrowKind, type ThrowResult } from '../engine/types';
import type { TFunc } from '../i18n/translations';

export function kindLabel(t: TFunc, kind: ThrowKind): string {
  return t(`kind.${kind}`);
}

export function kindDistance(t: TFunc, kind: ThrowKind): string {
  return t(`distance.${kind}`);
}

/** Plain-language description of where a piece currently sits, for the move-choice list. */
export function describePiecePosition(t: TFunc, node: BoardNodeId | null): string {
  if (node === null) return t('position.start');
  if (node === 'center') return t('position.center');
  if (isDiagonalArm(node)) return t('position.shortcut');
  return t('position.outer', { n: node.slice(1) });
}

/** "{Kind} · move N steps[ back]" header for a group of move choices sharing one pending result. */
export function describeThrowHeader(t: TFunc, result: ThrowResult): string {
  const steps = Math.abs(result.distance);
  const variant = steps === 1 ? 'one' : 'other';
  const direction = result.distance < 0 ? 'back' : 'forward';
  return t(`throwHeader.${direction}.${variant}`, { kind: kindLabel(t, result.kind), steps });
}

/** Piece number (stable slot index 1-4, not waiting-list order) and current position, split for card-style display. */
export function describeAssignmentParts(t: TFunc, state: GameState, assignment: LegalAssignment): { pieceLabel: string; positionLabel: string } {
  const owner = state.players.find((p) => p.id === state.activePlayer)!;
  const source = assignment.source;

  if (source.type === 'new') {
    const slot = owner.pieces.findIndex((p) => p.id === source.pieceId);
    return { pieceLabel: t('piece.label', { n: slot + 1 }), positionLabel: describePiecePosition(t, null) };
  }

  const group = state.groups.find((g) => g.id === source.groupId)!;
  const slot = owner.pieces.findIndex((p) => p.id === group.memberPieceIds[0]);
  const stackSuffix = group.memberPieceIds.length > 1 ? t('piece.stackSuffix', { count: group.memberPieceIds.length - 1 }) : '';
  return {
    pieceLabel: t('piece.label', { n: slot + 1 }) + stackSuffix,
    positionLabel: describePiecePosition(t, currentNode(group)),
  };
}

/** "Piece {n}[ (+k)] · {position}" — single-string form of describeAssignmentParts. */
export function describeSource(t: TFunc, state: GameState, assignment: LegalAssignment): string {
  const { pieceLabel, positionLabel } = describeAssignmentParts(t, state, assignment);
  return `${pieceLabel} · ${positionLabel}`;
}
