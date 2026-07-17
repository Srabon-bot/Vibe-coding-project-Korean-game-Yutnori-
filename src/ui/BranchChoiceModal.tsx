import { useEffect } from 'react';
import { playSound } from '../audio/sounds';
import { isDiagonalArm } from '../engine/board';
import type { BoardNodeId, NodeId } from '../engine/types';
import { useT } from '../i18n/useT';
import type { TFunc } from '../i18n/translations';
import { useGameStore } from '../store/gameStore';
import { describePiecePosition } from './format';

function describeOption(t: TFunc, opt: NodeId): string {
  if (opt === 'finish') return t('branch.optionFinish');
  if (isDiagonalArm(opt)) return t('branch.optionShortcut');
  return t('branch.optionOuter', { position: describePiecePosition(t, opt) });
}

export function BranchChoiceModal() {
  const phase = useGameStore((s) => s.game.phase);
  const branchContext = useGameStore((s) => s.game.branchContext);
  const chooseBranch = useGameStore((s) => s.chooseBranch);
  const setHoveredBranchOption = useGameStore((s) => s.setHoveredBranchOption);
  const t = useT();

  const isOpen = phase === 'branch-choice' && !!branchContext;

  useEffect(() => {
    if (isOpen) playSound('shortcut');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || !branchContext) return null;

  function handleChoose(opt: NodeId) {
    playSound('select');
    chooseBranch(opt as BoardNodeId);
  }

  return (
    <div className="panel-accent" style={{ padding: 18, textAlign: 'center' }} onMouseLeave={() => setHoveredBranchOption(null)}>
      <p className="panel-title" style={{ fontSize: '1.05rem' }}>
        {t('branch.title')}
      </p>
      <p style={{ margin: '0 0 12px', opacity: 0.85, fontSize: '0.85rem' }}>
        {t('branch.body', { position: describePiecePosition(t, branchContext.branchNode) })}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {branchContext.options.map((opt) => (
          <button
            key={opt}
            className="btn btn-gold"
            style={{ fontSize: '0.85rem' }}
            onClick={() => handleChoose(opt)}
            onMouseEnter={() => setHoveredBranchOption(opt as BoardNodeId)}
            onFocus={() => setHoveredBranchOption(opt as BoardNodeId)}
            onBlur={() => setHoveredBranchOption(null)}
          >
            {describeOption(t, opt)}
          </button>
        ))}
      </div>
    </div>
  );
}
