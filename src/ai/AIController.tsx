import { useEffect, useRef } from 'react';
import { playSound } from '../audio/sounds';
import { useGameStore } from '../store/gameStore';
import { pickAssignment, pickBranchOption, type AIDifficulty } from './aiPlayer';

/** Randomized "thinking" delay range per difficulty, in ms — keeps the AI's turn from feeling
 * instant/robotic while still reading as faster and more decisive at higher difficulties. */
const THINK_MS: Record<AIDifficulty, [number, number]> = {
  easy: [500, 1100],
  medium: [550, 1200],
  hard: [650, 1400],
};

function randomDelay([min, max]: [number, number]): number {
  return min + Math.random() * (max - min);
}

/** Non-visual component: whenever it's the configured AI player's turn, automatically throws,
 * assigns moves, and resolves branch choices via aiPlayer.ts's heuristics. A no-op outside a
 * VS AI game (aiPlayer/aiDifficulty null) or while off the game screen. */
export function AIController() {
  const screen = useGameStore((s) => s.screen);
  const game = useGameStore((s) => s.game);
  const revealing = useGameStore((s) => s.revealing);
  const legalAssignments = useGameStore((s) => s.legalAssignments);
  const aiPlayer = useGameStore((s) => s.aiPlayer);
  const aiDifficulty = useGameStore((s) => s.aiDifficulty);
  const throwSticks = useGameStore((s) => s.throwSticks);
  const assign = useGameStore((s) => s.assign);
  const chooseBranch = useGameStore((s) => s.chooseBranch);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;

    if (screen !== 'game' || !aiPlayer || !aiDifficulty) return;
    if (game.activePlayer !== aiPlayer || revealing) return;

    const delay = randomDelay(THINK_MS[aiDifficulty]);

    if (game.phase === 'throwing') {
      timerRef.current = setTimeout(() => throwSticks(), delay);
    } else if (game.phase === 'assigning' && legalAssignments.length > 0) {
      timerRef.current = setTimeout(() => {
        const choice = pickAssignment(game, legalAssignments, aiDifficulty);
        playSound('select');
        assign(choice.pendingResultId, choice.source);
      }, delay);
    } else if (game.phase === 'branch-choice' && game.branchContext) {
      const branchContext = game.branchContext;
      timerRef.current = setTimeout(() => {
        playSound('select');
        chooseBranch(pickBranchOption(branchContext, aiDifficulty));
      }, delay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [screen, game, revealing, legalAssignments, aiPlayer, aiDifficulty, throwSticks, assign, chooseBranch]);

  return null;
}
