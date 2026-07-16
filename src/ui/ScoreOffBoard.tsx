import { PLAYER_COLORS } from '../scene/Piece3D';
import { useGameStore } from '../store/gameStore';

export function ScoreOffBoard() {
  const players = useGameStore((s) => s.game.players);
  const piecesPerPlayer = useGameStore((s) => s.game.piecesPerPlayer);

  return (
    <div className="panel" style={{ padding: '10px 16px', display: 'flex', gap: 18 }}>
      {players.map((player) => {
        const finished = player.pieces.filter((p) => p.status === 'finished').length;
        return (
          <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>{player.nickname}</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: piecesPerPlayer }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: i < finished ? PLAYER_COLORS[player.id] : 'rgba(244,227,193,0.18)',
                    border: i < finished ? 'none' : '1px solid rgba(244,227,193,0.35)',
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
