interface NewGameConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NewGameConfirmModal({ open, onCancel, onConfirm }: NewGameConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="panel" style={{ padding: 28, maxWidth: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <p className="panel-title" style={{ fontSize: '1.2rem' }}>
          Start a new game?
        </p>
        <p style={{ margin: '0 0 20px', fontSize: '0.9rem', opacity: 0.85 }}>
          The current game's progress will be lost.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn" style={{ flex: 1 }} onClick={onConfirm}>
            Start new game
          </button>
        </div>
      </div>
    </div>
  );
}
