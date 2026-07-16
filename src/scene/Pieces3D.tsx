import type { GameState, Piece, Player } from '../engine/types';
import { getFinishSlotPosition, getNodePosition, getStackOffset, getWaitingSlotPosition, type Vec3 } from './boardLayout';
import { AnimatedPiece } from './Piece3D';

interface Pieces3DProps {
  game: GameState;
}

function addVec3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function waypointsFor(game: GameState, player: Player, piece: Piece): Vec3[] {
  if (piece.status === 'waiting') {
    const index = player.pieces.filter((p) => p.status === 'waiting').findIndex((p) => p.id === piece.id);
    return [getWaitingSlotPosition(player.id, index)];
  }
  if (piece.status === 'finished') {
    const index = player.pieces.filter((p) => p.status === 'finished').findIndex((p) => p.id === piece.id);
    return [getFinishSlotPosition(player.id, index)];
  }
  const group = game.groups.find((g) => g.memberPieceIds.includes(piece.id))!;
  const indexInGroup = group.memberPieceIds.indexOf(piece.id);
  const offset = getStackOffset(indexInGroup);
  return group.path.map((node) => addVec3(getNodePosition(node), offset));
}

/**
 * Renders every piece as a single flat list of AnimatedPiece, keyed by the piece's stable id,
 * regardless of its current status (waiting/onBoard/finished). This must NOT be split into
 * separate per-status `.map()` calls under different parents — React's key-based reconciliation
 * only preserves a component instance across renders within the *same* parent's children; moving
 * a piece's element to a different parent (e.g. a "waiting" branch vs an "onBoard" branch) forces
 * an unmount/remount even with a matching key, which reset AnimatedPiece's walk state and made
 * its first on-board move snap straight to the destination instead of animating through it.
 */
export function Pieces3D({ game }: Pieces3DProps) {
  return (
    <group>
      {game.players.flatMap((player) =>
        player.pieces.map((piece) => (
          <AnimatedPiece
            key={piece.id}
            waypoints={waypointsFor(game, player, piece)}
            ownerId={player.id}
            photoDataUrl={player.photoDataUrl}
          />
        )),
      )}
    </group>
  );
}
