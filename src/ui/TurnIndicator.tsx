import { useT } from '../i18n/useT';
import { PLAYER_COLORS } from '../scene/Piece3D';
import { useGameStore } from '../store/gameStore';

export function TurnIndicator() {
  const activePlayer = useGameStore((s) => s.game.activePlayer);
  const players = useGameStore((s) => s.game.players);
  const revealing = useGameStore((s) => s.revealing);
  const revealingThrower = useGameStore((s) => s.revealingThrower);
  const t = useT();

  const displayedPlayer = revealing && revealingThrower ? revealingThrower : activePlayer;
  const nickname = players.find((p) => p.id === displayedPlayer)!.nickname;

  return (
    <div className="panel" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: PLAYER_COLORS[displayedPlayer],
          boxShadow: '0 0 8px rgba(0,0,0,0.4)',
          flexShrink: 0,
        }}
      />
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
        {revealing ? t('turn.judging', { nickname }) : t('turn.turn', { nickname })}
      </span>
    </div>
  );
}
