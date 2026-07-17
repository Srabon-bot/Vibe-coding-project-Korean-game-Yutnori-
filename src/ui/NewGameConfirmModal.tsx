import { useEffect } from 'react';
import { playSound } from '../audio/sounds';
import { useT } from '../i18n/useT';

interface NewGameConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NewGameConfirmModal({ open, onCancel, onConfirm }: NewGameConfirmModalProps) {
  const t = useT();

  useEffect(() => {
    if (open) playSound('open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function handleCancel() {
    playSound('close');
    onCancel();
  }

  function handleConfirm() {
    playSound('click');
    onConfirm();
  }

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="panel ornate-frame" style={{ padding: 28, maxWidth: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <p className="panel-title" style={{ fontSize: '1.2rem' }}>
          {t('newGame.title')}
        </p>
        <p style={{ margin: '0 0 20px', fontSize: '0.9rem', opacity: 0.85 }}>{t('newGame.body')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleCancel}>
            {t('newGame.cancel')}
          </button>
          <button className="btn" style={{ flex: 1 }} onClick={handleConfirm}>
            {t('newGame.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
