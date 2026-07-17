import { playSound } from '../audio/sounds';
import type { LegalAssignment, ThrowKind } from '../engine/types';
import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';
import { describeAssignmentParts, describeThrowHeader, kindIcon } from './format';

interface ResultGroup {
  pendingResultId: string;
  kind: ThrowKind;
  header: string;
  assignments: LegalAssignment[];
}

export function PieceAssignmentPanel() {
  const phase = useGameStore((s) => s.game.phase);
  const revealing = useGameStore((s) => s.revealing);
  const game = useGameStore((s) => s.game);
  const legalAssignments = useGameStore((s) => s.legalAssignments);
  const assign = useGameStore((s) => s.assign);
  const setHoveredAssignment = useGameStore((s) => s.setHoveredAssignment);
  const t = useT();

  if (phase !== 'assigning' || revealing) return null;

  // Group by pending result (one throw's worth of choices), preserving queue order — a player
  // can have several results queued at once (e.g. after Yut/Mo/a catch).
  const groups: ResultGroup[] = [];
  for (const a of legalAssignments) {
    let group = groups.find((g) => g.pendingResultId === a.pendingResultId);
    if (!group) {
      const pending = game.pending.find((p) => p.id === a.pendingResultId)!;
      group = { pendingResultId: a.pendingResultId, kind: pending.result.kind, header: describeThrowHeader(t, pending.result), assignments: [] };
      groups.push(group);
    }
    group.assignments.push(a);
  }

  function handleAssign(a: LegalAssignment) {
    playSound('select');
    assign(a.pendingResultId, a.source);
  }

  return (
    <div className="panel-accent" style={{ padding: 14, width: '100%' }} onMouseLeave={() => setHoveredAssignment(null)}>
      <p className="panel-title" style={{ fontSize: '1rem' }}>
        {t('assignment.title')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groups.map((group) => (
          <div key={group.pendingResultId}>
            <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)', opacity: 0.9 }}>
              {kindIcon(group.kind) && <span aria-hidden="true">{kindIcon(group.kind)} </span>}
              {group.header}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 6 }}>
              {group.assignments.map((a, i) => {
                const { pieceLabel, positionLabel } = describeAssignmentParts(t, game, a);
                return (
                  <button
                    key={i}
                    className="btn btn-secondary"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 6px' }}
                    onClick={() => handleAssign(a)}
                    onMouseEnter={() => setHoveredAssignment(a)}
                    onFocus={() => setHoveredAssignment(a)}
                    onBlur={() => setHoveredAssignment(null)}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{pieceLabel}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>{positionLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
