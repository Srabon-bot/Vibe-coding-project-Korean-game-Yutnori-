import { useEffect } from 'react';
import type { AIDifficulty } from '../ai/aiPlayer';
import { playSound } from '../audio/sounds';
import { useT } from '../i18n/useT';

interface AIDifficultyModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (difficulty: AIDifficulty) => void;
}

const DIFFICULTIES: AIDifficulty[] = ['easy', 'medium', 'hard'];

export function AIDifficultyModal({ open, onCancel, onSelect }: AIDifficultyModalProps) {
  const t = useT();

  useEffect(() => {
    if (open) playSound('open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="panel ornate-frame"
        style={{ padding: 28, maxWidth: 420, width: '100%', textAlign: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="panel-title" style={{ fontSize: '1.2rem' }}>
          {t('home.aiDifficulty.title')}
        </p>
        <div className="taegeuk-divider" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              className="btn btn-gold"
              style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 16px' }}
              onClick={() => onSelect(level)}
            >
              <span style={{ fontSize: '1rem' }}>{t(`home.aiDifficulty.${level}`)}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.85 }}>{t(`home.aiDifficulty.${level}Desc`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
