import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { translate, type TFunc } from './translations';

/** Returns a `t(key, vars?)` function bound to the current language, re-created only when it changes. */
export function useT(): TFunc {
  const language = useGameStore((s) => s.language);
  return useCallback<TFunc>((key, vars) => translate(language, key, vars), [language]);
}
