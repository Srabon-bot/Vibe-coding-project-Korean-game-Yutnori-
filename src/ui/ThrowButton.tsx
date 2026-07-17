import { playSound } from '../audio/sounds';
import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';

export function ThrowButton() {
  const phase = useGameStore((s) => s.game.phase);
  const revealing = useGameStore((s) => s.revealing);
  const throwSticks = useGameStore((s) => s.throwSticks);
  const t = useT();

  if (revealing) {
    return (
      <div className="panel" style={{ fontSize: '1.05rem', padding: '14px 28px', opacity: 0.6, cursor: 'default' }}>
        {t('throwButton.checking')}
      </div>
    );
  }

  if (phase !== 'throwing') return null;

  function handleThrow() {
    playSound('click');
    throwSticks();
  }

  return (
    <button className="btn" onClick={handleThrow} style={{ fontSize: '1.05rem', padding: '14px 28px' }}>
      {t('throwButton.throw')}
    </button>
  );
}
