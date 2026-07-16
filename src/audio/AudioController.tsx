import { useEffect } from 'react';
import type { GameEvent } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { playSound, setMuted, type SoundKind } from './sounds';

const SOUND_FOR_EVENT: Partial<Record<GameEvent['type'], SoundKind>> = {
  throw: 'throw',
  catch: 'catch',
  stack: 'stack',
  finish: 'finish',
  win: 'win',
};

/** Non-visual component: plays a sound effect for each relevant event the store emits. */
export function AudioController() {
  const lastEvents = useGameStore((s) => s.lastEvents);
  const soundMuted = useGameStore((s) => s.soundMuted);

  useEffect(() => {
    setMuted(soundMuted);
  }, [soundMuted]);

  useEffect(() => {
    if (lastEvents.length === 0) return;
    const timers = lastEvents.map((event, i) => {
      const kind = SOUND_FOR_EVENT[event.type];
      if (!kind) return null;
      return setTimeout(() => playSound(kind), i * 160);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEvents]);

  return null;
}
