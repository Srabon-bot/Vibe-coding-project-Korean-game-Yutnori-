import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';

/** Small persistent rules reminder, docked in the left side column during play. */
export function RulesReminder() {
  const phase = useGameStore((s) => s.game.phase);
  const t = useT();

  if (phase === 'game-over') return null;

  return (
    <div className="panel-accent" style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.78rem', opacity: 0.9 }}>
      {t('rules.reminder')}
    </div>
  );
}
