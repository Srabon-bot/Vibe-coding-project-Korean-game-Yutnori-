import { useEffect } from 'react';
import { playSound } from '../audio/sounds';
import { useT } from '../i18n/useT';
import { kindAnimal, kindDistance, kindIcon, kindLabel } from './format';
import type { ThrowKind } from '../engine/types';

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

const THROW_KINDS: ThrowKind[] = ['do', 'gae', 'geol', 'yut', 'mo', 'backdo'];

function ThrowKindGrid() {
  const t = useT();
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
          <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            {kindIcon(kind) && <span aria-hidden="true">{kindIcon(kind)}</span>}
            {kindLabel(t, kind)}
            {kindAnimal(t, kind) && (
              <span style={{ fontWeight: 400, opacity: 0.65, fontSize: '0.72rem' }}>({kindAnimal(t, kind)})</span>
            )}
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>{kindDistance(t, kind)}</span>
        </div>
      ))}
    </div>
  );
}

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  const t = useT();

  useEffect(() => {
    if (open) playSound('open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const cards = [
    { no: '01', title: t('tutorial.card1.title'), body: t('tutorial.card1.body') },
    { no: '02', title: t('tutorial.card2.title'), body: '' },
    { no: '03', title: t('tutorial.card3.title'), body: t('tutorial.card3.body') },
    { no: '04', title: t('tutorial.card4.title'), body: t('tutorial.card4.body') },
  ];

  function handleClose() {
    playSound('close');
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="panel ornate-frame"
        style={{ padding: 28, maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="panel-title" style={{ fontSize: '1.4rem' }}>
          {t('tutorial.title')}
        </p>
        <div className="taegeuk-divider" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cards.map((card) => (
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
        <button className="btn" style={{ marginTop: 18, width: '100%' }} onClick={handleClose}>
          {t('tutorial.play')}
        </button>
      </div>
    </div>
  );
}
