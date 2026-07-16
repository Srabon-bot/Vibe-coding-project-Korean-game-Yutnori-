import { KIND_DISTANCE, KIND_LABEL } from './format';
import { useGameStore } from '../store/gameStore';

export function ThrowResultBanner() {
  const pending = useGameStore((s) => s.game.pending);

  if (pending.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {pending.map((p) => (
        <div key={p.id} className="pill" title={KIND_DISTANCE[p.result.kind]}>
          {KIND_LABEL[p.result.kind]}
          {(p.result.kind === 'yut' || p.result.kind === 'mo') && ' ⭐'}
        </div>
      ))}
    </div>
  );
}
