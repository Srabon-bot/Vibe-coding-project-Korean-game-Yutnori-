import { create } from 'zustand';
import type { AIDifficulty } from '../ai/aiPlayer';
import { createInitialState, type CreateGameConfig } from '../engine/game';
import {
  beginAssignment,
  chooseBranch as chooseBranchEngine,
  getLegalAssignments,
  throwSticks,
} from '../engine/turn';
import type { BoardNodeId, GameEvent, GameState, LegalAssignment, MoveSource, PlayerId } from '../engine/types';
import { LANGUAGES, type Language } from '../i18n/translations';
import { STICK_SETTLE_MS } from '../ui/timing';

export type Screen = 'home' | 'game';

interface GameStore {
  game: GameState;
  lastEvents: GameEvent[];
  legalAssignments: LegalAssignment[];
  soundMuted: boolean;
  language: Language;
  screen: Screen;
  /** Set only for a VS AI game — which player id the AI controls, and how it plays. Both null for a local pass-and-play game. */
  aiPlayer: PlayerId | null;
  aiDifficulty: AIDifficulty | null;
  /** The move-choice button currently hovered/focused, for the on-board preview highlight. UI-only, not persisted. */
  hoveredAssignment: LegalAssignment | null;
  /** The junction-choice option currently hovered/focused, for the same on-board preview during a branch choice. */
  hoveredBranchOption: BoardNodeId | null;
  /** True for STICK_SETTLE_MS after a throw, while the sticks are still visually tumbling. UI-only gate. */
  revealing: boolean;
  /** Who threw, captured before any turn-end — for the "Judging {player}'s throw" label during `revealing`. */
  revealingThrower: PlayerId | null;
  throwSticks: () => void;
  assign: (pendingResultId: string, source: MoveSource) => void;
  chooseBranch: (node: BoardNodeId) => void;
  restart: (config?: CreateGameConfig) => void;
  toggleSound: () => void;
  cycleLanguage: () => void;
  setScreen: (screen: Screen) => void;
  configureAI: (playerId: PlayerId | null, difficulty: AIDifficulty | null) => void;
  setHoveredAssignment: (assignment: LegalAssignment | null) => void;
  setHoveredBranchOption: (node: BoardNodeId | null) => void;
}

/** Not store state (doesn't need to trigger renders) — just lets a stale reveal timer from an
 * earlier throw recognize it's been superseded by a newer one (e.g. back-to-back extra throws)
 * and skip clearing `revealing` early. */
let revealToken = 0;

function withDerived(game: GameState, events: GameEvent[]): Pick<GameStore, 'game' | 'lastEvents' | 'legalAssignments'> {
  return { game, lastEvents: events, legalAssignments: game.phase === 'assigning' ? getLegalAssignments(game) : [] };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...withDerived(createInitialState(), []),
  soundMuted: false,
  language: 'en',
  screen: 'home',
  aiPlayer: null,
  aiDifficulty: null,
  hoveredAssignment: null,
  hoveredBranchOption: null,
  revealing: false,
  revealingThrower: null,

  toggleSound: () => set((s) => ({ soundMuted: !s.soundMuted })),
  cycleLanguage: () =>
    set((s) => {
      const next = LANGUAGES[(LANGUAGES.indexOf(s.language) + 1) % LANGUAGES.length];
      return { language: next };
    }),
  // Leaving the game screen always clears any AI config, so a frozen background game (from a
  // mid-match "New Game") can't keep silently auto-playing while the player is back on the menu.
  setScreen: (screen) => set(screen === 'home' ? { screen, aiPlayer: null, aiDifficulty: null } : { screen }),
  configureAI: (playerId, difficulty) => set({ aiPlayer: playerId, aiDifficulty: difficulty }),

  setHoveredAssignment: (assignment) => set({ hoveredAssignment: assignment }),
  setHoveredBranchOption: (node) => set({ hoveredBranchOption: node }),

  throwSticks: () => {
    const priorPlayer = get().game.activePlayer;
    const { state, events } = throwSticks(get().game);
    const myToken = ++revealToken;
    set({ ...withDerived(state, events), revealing: true, revealingThrower: priorPlayer });
    setTimeout(() => {
      if (revealToken === myToken) set({ revealing: false });
    }, STICK_SETTLE_MS);
  },

  assign: (pendingResultId, source) => {
    const { state, events } = beginAssignment(get().game, pendingResultId, source);
    set({ ...withDerived(state, events), hoveredAssignment: null });
  },

  chooseBranch: (node) => {
    const { state, events } = chooseBranchEngine(get().game, node);
    set({ ...withDerived(state, events), hoveredBranchOption: null });
  },

  restart: (config) => {
    revealToken++;
    set({
      ...withDerived(createInitialState(config), []),
      hoveredAssignment: null,
      hoveredBranchOption: null,
      revealing: false,
      revealingThrower: null,
    });
  },
}));
