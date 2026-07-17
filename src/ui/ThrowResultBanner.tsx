import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';
import { kindDistance, kindLabel } from './format';

export function ThrowResultBanner() {
  const pending = useGameStore((s) => s.game.pending);
  const t = useT();

  if (pending.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      {pending.map((p) => (
        <div key={p.id} className="pill" title={kindDistance(t, p.result.kind)}>
          {kindLabel(t, p.result.kind)}
          {(p.result.kind === 'yut' || p.result.kind === 'mo') && ' ⭐'}
        </div>
      ))}
    </div>
  );
}
