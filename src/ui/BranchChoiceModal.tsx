import { isDiagonalArm } from '../engine/board';
import type { BoardNodeId, NodeId } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { describePiecePosition } from './format';

function describeOption(opt: NodeId): string {
  if (opt === 'finish') return 'Head straight to the finish';
  if (isDiagonalArm(opt)) return 'Take the shortcut through the center';
  return `Continue along the outer path (${describePiecePosition(opt)})`;
}

export function BranchChoiceModal() {
  const phase = useGameStore((s) => s.game.phase);
  const branchContext = useGameStore((s) => s.game.branchContext);
  const chooseBranch = useGameStore((s) => s.chooseBranch);
  const setHoveredBranchOption = useGameStore((s) => s.setHoveredBranchOption);

  if (phase !== 'branch-choice' || !branchContext) return null;

  return (
    <div className="panel-accent" style={{ padding: 18, textAlign: 'center' }} onMouseLeave={() => setHoveredBranchOption(null)}>
      <p className="panel-title" style={{ fontSize: '1.05rem' }}>
        A shortcut is available!
      </p>
      <p style={{ margin: '0 0 12px', opacity: 0.85, fontSize: '0.85rem' }}>
        Your piece reached {describePiecePosition(branchContext.branchNode)}. Continue along the outer path, or cut through the center?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {branchContext.options.map((opt) => (
          <button
            key={opt}
            className="btn btn-gold"
            style={{ fontSize: '0.85rem' }}
            onClick={() => chooseBranch(opt as BoardNodeId)}
            onMouseEnter={() => setHoveredBranchOption(opt as BoardNodeId)}
            onFocus={() => setHoveredBranchOption(opt as BoardNodeId)}
            onBlur={() => setHoveredBranchOption(null)}
          >
            {describeOption(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}
