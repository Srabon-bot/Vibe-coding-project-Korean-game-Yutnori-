import { KIND_DISTANCE, KIND_LABEL } from './format';
import type { ThrowKind } from '../engine/types';

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

const THROW_KINDS: ThrowKind[] = ['do', 'gae', 'geol', 'yut', 'mo', 'backdo'];

const CARDS: { no: string; title: string; body: string }[] = [
  {
    no: '01',
    title: 'Finish all 4 pieces first',
    body: 'Throw the yut sticks and move a piece by the number shown. The first player to bring all 4 pieces across the finish wins.',
  },
  {
    no: '02',
    title: 'Yut throws',
    body: '',
  },
  {
    no: '03',
    title: 'Stacking and capturing',
    body: "Land on your own piece to stack up and move together. Land on an opponent's piece to send it back to Start — and you get another throw.",
  },
  {
    no: '04',
    title: 'Shortcuts through the center',
    body: 'Land exactly on a junction or the center to unlock a shortcut on your next move. Check the on-board preview and pick the better route.',
  },
];

function ThrowKindGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 8 }}>
      {THROW_KINDS.map((kind) => (
        <div
          key={kind}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(244,227,193,0.06)',
            border: '1px solid rgba(244,227,193,0.15)',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{KIND_LABEL[kind]}</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{KIND_DISTANCE[kind]}</span>
        </div>
      ))}
    </div>
  );
}

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="panel"
        style={{ padding: 28, maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="panel-title" style={{ fontSize: '1.4rem' }}>
          How to play Yutnori (윷놀이)
        </p>
        <div className="taegeuk-divider" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CARDS.map((card) => (
            <div
              key={card.no}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(244,227,193,0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold)', fontSize: '0.85rem', opacity: 0.85 }}>
                  {card.no}
                </span>
                <p style={{ fontWeight: 700, margin: 0 }}>{card.title}</p>
              </div>
              {card.body && <p style={{ margin: '6px 0 0', fontSize: '0.88rem', lineHeight: 1.5, opacity: 0.9 }}>{card.body}</p>}
              {card.no === '02' && <ThrowKindGrid />}
            </div>
          ))}
        </div>
        <button className="btn" style={{ marginTop: 18, width: '100%' }} onClick={onClose}>
          Let's play!
        </button>
      </div>
    </div>
  );
}
