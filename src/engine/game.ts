import type { GameState, Piece, PlayerId } from './types';

export interface PlayerConfig {
  nickname?: string;
  photoDataUrl?: string | null;
}

export interface CreateGameConfig {
  piecesPerPlayer?: number;
  players?: Partial<Record<PlayerId, PlayerConfig>>;
}

export function createInitialState(config: CreateGameConfig = {}): GameState {
  const piecesPerPlayer = config.piecesPerPlayer ?? 4;

  const makePieces = (ownerId: PlayerId): Piece[] =>
    Array.from({ length: piecesPerPlayer }, (_, i) => ({
      id: `${ownerId}-piece-${i}`,
      ownerId,
      status: 'waiting' as const,
      groupId: null,
    }));

  const defaultLabel: Record<PlayerId, string> = { p1: 'Player 1', p2: 'Player 2' };

  return {
    players: (['p1', 'p2'] as const).map((id) => ({
      id,
      nickname: config.players?.[id]?.nickname ?? defaultLabel[id],
      photoDataUrl: config.players?.[id]?.photoDataUrl ?? null,
      pieces: makePieces(id),
    })) as [GameState['players'][0], GameState['players'][1]],
    groups: [],
    activePlayer: 'p1',
    phase: 'throwing',
    pending: [],
    branchContext: null,
    winner: null,
    piecesPerPlayer,
  };
}

/** First player with every piece marked 'finished', or null if the game is still in progress. */
export function checkWinner(state: GameState): PlayerId | null {
  for (const player of state.players) {
    if (player.pieces.every((p) => p.status === 'finished')) return player.id;
  }
  return null;
}

export function restartGame(config: CreateGameConfig = {}): GameState {
  return createInitialState(config);
}
