import { useGameStore } from '../store/gameStore';

interface SettingsMenuProps {
  onOpenTutorial: () => void;
  onRequestNewGame: () => void;
}

export function SettingsMenu({ onOpenTutorial, onRequestNewGame }: SettingsMenuProps) {
  const soundMuted = useGameStore((s) => s.soundMuted);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <div className="panel" style={{ padding: 8, display: 'flex', gap: 6 }}>
      <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={toggleSound} title="Toggle sound effects">
        {soundMuted ? '🔇' : '🔊'}
      </button>
      <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={onOpenTutorial} title="How to play">
        ❓
      </button>
      <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={onRequestNewGame} title="New game">
        🔄
      </button>
    </div>
  );
}
