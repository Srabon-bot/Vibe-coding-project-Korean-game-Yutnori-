import { useEffect, useRef, useState } from 'react';
import type { GameEvent } from '../engine/types';
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
  // Tracks which throw event we've already scheduled a show/hide cycle for, and the timers of
  // that cycle. Later renders where lastEvents changes for an unrelated reason (e.g. the player
  // assigns a move before the popup's own timers fire) must NOT cancel an in-flight cycle just
  // because this event batch happens to contain no throw event — otherwise the popup gets stuck
  // visible until the next throw resets everything.
  const seenThrowRef = useRef<GameEvent | null>(null);
  const timersRef = useRef<{ show?: ReturnType<typeof setTimeout>; hide?: ReturnType<typeof setTimeout>; clear?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    const throwEvent = lastEvents.find((e) => e.type === 'throw');
    if (!throwEvent || throwEvent.type !== 'throw' || throwEvent === seenThrowRef.current) return;
    seenThrowRef.current = throwEvent;

    clearTimeout(timersRef.current.show);
    clearTimeout(timersRef.current.hide);
    clearTimeout(timersRef.current.clear);

    timersRef.current.show = setTimeout(() => {
      setDisplay({
        icon: kindIcon(throwEvent.result.kind),
        kind: kindLabel(t, throwEvent.result.kind),
        animal: kindAnimal(t, throwEvent.result.kind),
        distanceText: kindDistance(t, throwEvent.result.kind),
      });
      setVisible(true);
    }, STICK_SETTLE_MS);
    timersRef.current.hide = setTimeout(() => setVisible(false), STICK_SETTLE_MS + VISIBLE_MS);
    timersRef.current.clear = setTimeout(() => setDisplay(null), STICK_SETTLE_MS + VISIBLE_MS + FADE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEvents, t]);

  useEffect(
    () => () => {
      clearTimeout(timersRef.current.show);
      clearTimeout(timersRef.current.hide);
      clearTimeout(timersRef.current.clear);
    },
    [],
  );

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
