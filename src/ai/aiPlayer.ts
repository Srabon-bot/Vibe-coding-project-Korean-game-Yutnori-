import { isDiagonalArm } from '../engine/board';
import { beginAssignment } from '../engine/turn';
import { getGroup, type BoardNodeId, type BranchContext, type GameState, type LegalAssignment, type NodeId } from '../engine/types';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface Weights {
  catch: number;
  finish: number;
  stack: number;
  progress: number;
  newPiecePenalty: number;
  randomJitter: number;
}

const WEIGHTS: Record<'medium' | 'hard', Weights> = {
  medium: { catch: 100, finish: 50, stack: 20, progress: 1, newPiecePenalty: -4, randomJitter: 8 },
  hard: { catch: 200, finish: 80, stack: 25, progress: 2, newPiecePenalty: -6, randomJitter: 0 },
};

/** Speculatively commits a candidate assignment against a *copy* of the engine state (beginAssignment
 * never mutates its input) and scores the resulting events/position. Higher is better. */
function scoreAssignment(state: GameState, candidate: LegalAssignment, weights: Weights): number {
  const result = beginAssignment(state, candidate.pendingResultId, candidate.source);
  let score = 0;
  for (const event of result.events) {
    if (event.type === 'catch') score += weights.catch;
    if (event.type === 'finish') score += weights.finish;
    if (event.type === 'stack') score += weights.stack;
  }
  if (candidate.source.type === 'group') {
    // Longer path-so-far is a cheap proxy for "closer to home" — prefer advancing pieces that
    // are already on their way rather than always pulling a fresh piece off the waiting line.
    score += weights.progress * getGroup(state, candidate.source.groupId).path.length;
  } else {
    score += weights.newPiecePenalty;
  }
  score += (Math.random() - 0.5) * weights.randomJitter;
  return score;
}

/** Picks which pending throw result to assign to which piece/group. */
export function pickAssignment(state: GameState, legalAssignments: LegalAssignment[], difficulty: AIDifficulty): LegalAssignment {
  if (difficulty === 'easy' || legalAssignments.length === 1) {
    return legalAssignments[Math.floor(Math.random() * legalAssignments.length)];
  }
  const weights = WEIGHTS[difficulty];
  let best = legalAssignments[0];
  let bestScore = -Infinity;
  for (const candidate of legalAssignments) {
    const score = scoreAssignment(state, candidate, weights);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

/** finish > shortcut > outer path — a simple, deterministic route preference for Medium/Hard. */
function optionPriority(opt: NodeId): number {
  if (opt === 'finish') return 2;
  if (isDiagonalArm(opt)) return 1;
  return 0;
}

/** Picks which junction option to take when a shortcut choice is offered. */
export function pickBranchOption(branchContext: BranchContext, difficulty: AIDifficulty): BoardNodeId {
  const options = branchContext.options;
  if (difficulty === 'easy') {
    return options[Math.floor(Math.random() * options.length)] as BoardNodeId;
  }
  const sorted = [...options].sort((a, b) => optionPriority(b) - optionPriority(a));
  return sorted[0] as BoardNodeId;
}
