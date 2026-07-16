import { describe, expect, it } from 'vitest';
import { checkWinner, createInitialState, restartGame } from './game';

describe('createInitialState', () => {
  it('creates two players with the configured number of waiting pieces', () => {
    const state = createInitialState({ piecesPerPlayer: 4 });
    expect(state.players).toHaveLength(2);
    for (const player of state.players) {
      expect(player.pieces).toHaveLength(4);
      expect(player.pieces.every((p) => p.status === 'waiting')).toBe(true);
    }
    expect(state.groups).toEqual([]);
    expect(state.activePlayer).toBe('p1');
    expect(state.phase).toBe('throwing');
    expect(state.winner).toBeNull();
  });

  it('applies nickname and photo customization per player', () => {
    const state = createInitialState({
      players: { p1: { nickname: 'Alice', photoDataUrl: 'data:image/png;base64,xyz' }, p2: { nickname: 'Bob' } },
    });
    expect(state.players[0].nickname).toBe('Alice');
    expect(state.players[0].photoDataUrl).toBe('data:image/png;base64,xyz');
    expect(state.players[1].nickname).toBe('Bob');
    expect(state.players[1].photoDataUrl).toBeNull();
  });
});

describe('checkWinner', () => {
  it('returns null while any player has an unfinished piece', () => {
    const state = createInitialState();
    expect(checkWinner(state)).toBeNull();
  });

  it('returns the player id once all of their pieces are finished', () => {
    const state = createInitialState({ piecesPerPlayer: 2 });
    const won = {
      ...state,
      players: [
        { ...state.players[0], pieces: state.players[0].pieces.map((p) => ({ ...p, status: 'finished' as const })) },
        state.players[1],
      ] as typeof state.players,
    };
    expect(checkWinner(won)).toBe('p1');
  });
});

describe('restartGame', () => {
  it('produces a fresh initial state', () => {
    expect(restartGame({ piecesPerPlayer: 3 })).toEqual(createInitialState({ piecesPerPlayer: 3 }));
  });
});
