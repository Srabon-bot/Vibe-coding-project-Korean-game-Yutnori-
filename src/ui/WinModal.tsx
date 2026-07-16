import { PLAYER_COLORS } from '../scene/Piece3D';
import { useGameStore } from '../store/gameStore';

export function WinModal() {
  const phase = useGameStore((s) => s.game.phase);
  const winner = useGameStore((s) => s.game.winner);
  const winnerNickname = useGameStore((s) => s.game.players.find((p) => p.id === s.game.winner)?.nickname);
  const piecesPerPlayer = useGameStore((s) => s.game.piecesPerPlayer);
  const restart = useGameStore((s) => s.restart);

  if (phase !== 'game-over' || !winner) return null;

  return (
    <div className="modal-backdrop">
      <div className="panel" style={{ padding: '32px 40px', textAlign: 'center', maxWidth: 420 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: PLAYER_COLORS[winner],
            margin: '0 auto 12px',
            boxShadow: `0 0 20px ${PLAYER_COLORS[winner]}`,
          }}
        />
        <p className="panel-title" style={{ fontSize: '1.8rem', margin: '0 0 4px' }}>
          {winnerNickname} wins!
        </p>
        <p style={{ opacity: 0.8, margin: '0 0 20px', fontSize: '0.9rem' }}>
          All pieces made it home. 축하합니다! (Congratulations!)
        </p>
        <div className="taegeuk-divider" />
        <button className="btn" style={{ marginTop: 16 }} onClick={() => restart({ piecesPerPlayer })}>
          Play again
        </button>
      </div>
    </div>
  );
}
