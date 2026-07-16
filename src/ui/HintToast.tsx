import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const HINTS = {
  firstThrow: 'Nice throw! Pick a legal move below — or keep throwing if you earned an extra turn.',
  firstCatch: 'Caught! Their piece is sent back to start, and you get another throw.',
  firstStack: 'Stacked! Those pieces now move together as one group for the rest of the game.',
};

/** Shows a brief contextual tip the first time each key game moment happens, then never again. */
export function HintToast() {
  const lastEvents = useGameStore((s) => s.lastEvents);
  const seen = useRef<Set<keyof typeof HINTS>>(new Set());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let next: string | null = null;
    if (!seen.current.has('firstThrow') && lastEvents.some((e) => e.type === 'throw')) {
      seen.current.add('firstThrow');
      next = HINTS.firstThrow;
    }
    if (!seen.current.has('firstCatch') && lastEvents.some((e) => e.type === 'catch')) {
      seen.current.add('firstCatch');
      next = HINTS.firstCatch;
    }
    if (!seen.current.has('firstStack') && lastEvents.some((e) => e.type === 'stack')) {
      seen.current.add('firstStack');
      next = HINTS.firstStack;
    }
    if (!next) return;
    setMessage(next);
    const timer = setTimeout(() => setMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [lastEvents]);

  if (!message) return null;

  return (
    <div className="panel-accent" style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.85rem' }}>
      {message}
    </div>
  );
}
