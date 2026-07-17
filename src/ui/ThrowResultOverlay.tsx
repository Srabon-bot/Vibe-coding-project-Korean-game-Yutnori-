import { useEffect, useState } from 'react';
import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';
import { kindAnimal, kindDistance, kindIcon, kindLabel } from './format';
import { STICK_SETTLE_MS } from './timing';

const VISIBLE_MS = 1800;
const FADE_MS = 500;

/**
 * Large centered "Gae · 2 spaces" callout over the board, timed to appear right as the yut
 * sticks finish tumbling (Scene.tsx settles at STICK_SETTLE_MS) and fade out shortly after.
 * Additive to the bottom pending-result pills (ThrowResultBanner), not a replacement.
 */
export function ThrowResultOverlay() {
  const lastEvents = useGameStore((s) => s.lastEvents);
  const [visible, setVisible] = useState(false);
  const [display, setDisplay] = useState<{ icon: string; kind: string; animal: string; distanceText: string } | null>(null);
  const t = useT();

  useEffect(() => {
    const throwEvent = lastEvents.find((e) => e.type === 'throw');
    if (!throwEvent || throwEvent.type !== 'throw') return;

    const showTimer = setTimeout(() => {
      setDisplay({
        icon: kindIcon(throwEvent.result.kind),
        kind: kindLabel(t, throwEvent.result.kind),
        animal: kindAnimal(t, throwEvent.result.kind),
        distanceText: kindDistance(t, throwEvent.result.kind),
      });
      setVisible(true);
    }, STICK_SETTLE_MS);
    const hideTimer = setTimeout(() => setVisible(false), STICK_SETTLE_MS + VISIBLE_MS);
    const clearTimer = setTimeout(() => setDisplay(null), STICK_SETTLE_MS + VISIBLE_MS + FADE_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEvents]);

  if (!display) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '54%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <div className="glass-panel" style={{ padding: '16px 40px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.8,
            color: 'var(--color-paper)',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {t('throwOverlay.result')}
        </div>
        <div
          className="panel-title"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', margin: '2px 0', textShadow: '0 4px 18px rgba(0,0,0,0.55)' }}
        >
          {display.icon && <span aria-hidden="true">{display.icon} </span>}
          {display.kind}
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--color-paper)', opacity: 0.9, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {display.animal && `${display.animal} · `}
          {display.distanceText}
        </div>
      </div>
    </div>
  );
}
