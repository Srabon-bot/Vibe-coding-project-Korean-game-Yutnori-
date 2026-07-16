import { Html, Line } from '@react-three/drei';
import { useMemo } from 'react';
import type { BoardNodeId } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { KIND_LABEL } from '../ui/format';
import { previewAssignment, previewBranchOption, type MovePreview } from '../ui/movePreview';
import { getFinishSlotPosition, getNodePosition, getWaitingSlotPosition, type Vec3 } from './boardLayout';

function GlowRing({ position, color }: { position: Vec3; color: string }) {
  return (
    <mesh position={[position[0], position[1] + 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.48, 0.64, 40]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} depthWrite={false} />
    </mesh>
  );
}

function PreviewLabel({ position, children }: { position: Vec3; children: string }) {
  return (
    <Html position={[position[0], position[1] + 0.7, position[2]]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
      <div className="panel" style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {children}
      </div>
    </Html>
  );
}

/**
 * Renders a hover preview for whichever board decision is currently focused: a move-choice
 * button (PieceAssignmentPanel) or a junction-choice option (BranchChoiceModal). Both resolve to
 * the same MovePreview shape, so one renderer covers a glow ring at the source piece's spot, a
 * connecting guide line, a glow ring at the destination, and a floating label ("Gae lands here" /
 * "Gae — choose a path here"). Mirrors the reference screenshots' hover interaction, in our own
 * gold/parchment palette instead of copying their blue highlight.
 */
export function MovePreview3D() {
  const game = useGameStore((s) => s.game);
  const hovered = useGameStore((s) => s.hoveredAssignment);
  const hoveredBranchOption = useGameStore((s) => s.hoveredBranchOption);

  const resolved = useMemo((): { preview: MovePreview; pendingResultId: string } | null => {
    if (game.phase === 'branch-choice' && game.branchContext && hoveredBranchOption) {
      return {
        preview: previewBranchOption(game, game.branchContext, hoveredBranchOption),
        pendingResultId: game.branchContext.pendingResultId,
      };
    }
    if (game.phase === 'assigning' && hovered) {
      const preview = previewAssignment(game, hovered);
      return preview ? { preview, pendingResultId: hovered.pendingResultId } : null;
    }
    return null;
  }, [game, hovered, hoveredBranchOption]);

  if (!resolved) return null;
  const { preview, pendingResultId } = resolved;

  const pending = game.pending.find((p) => p.id === pendingResultId);
  if (!pending) return null;
  const kindLabel = KIND_LABEL[pending.result.kind];

  const sourcePos: Vec3 =
    preview.source.type === 'waiting'
      ? getWaitingSlotPosition(preview.source.ownerId, preview.source.waitingIndex)
      : getNodePosition(preview.source.node);

  if (preview.kind === 'leaves-board') {
    return (
      <group>
        <GlowRing position={sourcePos} color="#c9a227" />
        <PreviewLabel position={sourcePos}>{`${kindLabel} sends it back to Start`}</PreviewLabel>
      </group>
    );
  }

  const boardPath = preview.path.filter((n): n is BoardNodeId => n !== 'finish');
  const reachesFinish = preview.path[preview.path.length - 1] === 'finish';
  const owner = game.players.find((p) => p.id === game.activePlayer)!;
  const finishIndex = owner.pieces.filter((p) => p.status === 'finished').length;

  const lastBoardNode = boardPath[boardPath.length - 1];
  const destPos: Vec3 = reachesFinish
    ? getFinishSlotPosition(game.activePlayer, finishIndex)
    : lastBoardNode
      ? getNodePosition(lastBoardNode)
      : sourcePos;

  const linePoints: Vec3[] = [sourcePos, ...boardPath.map((n) => getNodePosition(n)), ...(reachesFinish ? [destPos] : [])];

  const labelText = reachesFinish
    ? `${kindLabel} — finishes!`
    : preview.needsChoice
      ? `${kindLabel} — choose a path here`
      : `${kindLabel} lands here`;

  return (
    <group>
      <Line points={linePoints} color="#c9a227" lineWidth={2.5} transparent opacity={0.8} />
      <GlowRing position={sourcePos} color="#c9a227" />
      <GlowRing position={destPos} color="#f4e3c1" />
      <PreviewLabel position={destPos}>{labelText}</PreviewLabel>
    </group>
  );
}
