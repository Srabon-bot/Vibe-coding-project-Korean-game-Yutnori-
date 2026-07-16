import { useGameStore } from '../store/gameStore';

export function ThrowButton() {
  const phase = useGameStore((s) => s.game.phase);
  const revealing = useGameStore((s) => s.revealing);
  const throwSticks = useGameStore((s) => s.throwSticks);

  if (revealing) {
    return (
      <div className="panel" style={{ fontSize: '1.05rem', padding: '14px 28px', opacity: 0.6, cursor: 'default' }}>
        Checking the result
      </div>
    );
  }

  if (phase !== 'throwing') return null;

  return (
    <button className="btn" onClick={throwSticks} style={{ fontSize: '1.05rem', padding: '14px 28px' }}>
      Throw sticks
    </button>
  );
}
