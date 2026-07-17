import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';

const HINT_KEYS = {
  firstThrow: 'hint.firstThrow',
  firstCatch: 'hint.firstCatch',
  firstStack: 'hint.firstStack',
} as const;

/** Shows a brief contextual tip the first time each key game moment happens, then never again. */
export function HintToast() {
  const lastEvents = useGameStore((s) => s.lastEvents);
  const seen = useRef<Set<keyof typeof HINT_KEYS>>(new Set());
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const t = useT();

  useEffect(() => {
    let next: string | null = null;
    if (!seen.current.has('firstThrow') && lastEvents.some((e) => e.type === 'throw')) {
      seen.current.add('firstThrow');
      next = HINT_KEYS.firstThrow;
    }
    if (!seen.current.has('firstCatch') && lastEvents.some((e) => e.type === 'catch')) {
      seen.current.add('firstCatch');
      next = HINT_KEYS.firstCatch;
    }
    if (!seen.current.has('firstStack') && lastEvents.some((e) => e.type === 'stack')) {
      seen.current.add('firstStack');
      next = HINT_KEYS.firstStack;
    }
    if (!next) return;
    setMessageKey(next);
    const timer = setTimeout(() => setMessageKey(null), 4500);
    return () => clearTimeout(timer);
  }, [lastEvents]);

  if (!messageKey) return null;

  return (
    <div className="panel-accent" style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.85rem' }}>
      {t(messageKey)}
    </div>
  );
}
