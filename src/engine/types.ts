export type PlayerId = 'p1' | 'p2';

export type PerimeterNodeId =
  | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'
  | 'p6' | 'p7' | 'p8' | 'p9' | 'p10'
  | 'p11' | 'p12' | 'p13' | 'p14' | 'p15'
  | 'p16' | 'p17' | 'p18' | 'p19';

/** The outer diagonal node adjacent to each corner — the first step onto a shortcut. */
export type OuterArmId = 'd0a' | 'd5a' | 'd10a' | 'd15a';
/** The inner diagonal node adjacent to the center — the second step onto a shortcut. */
export type InnerArmId = 'd0b' | 'd5b' | 'd10b' | 'd15b';
export type DiagonalArmId = OuterArmId | InnerArmId;

/** Every real space a piece can occupy on the board (excludes the virtual 'finish' node). */
export type BoardNodeId = 'p0' | PerimeterNodeId | DiagonalArmId | 'center';

/** BoardNodeId plus the virtual terminal node reached after completing the lap. */
export type NodeId = BoardNodeId | 'finish';

export type Face = 'flat' | 'round';

export type ThrowKind = 'do' | 'gae' | 'geol' | 'yut' | 'mo' | 'backdo';

export interface ThrowResult {
  kind: ThrowKind;
  /** Spaces to move: 1-5 forward, or -1 for back-do. */
  distance: number;
  grantsExtraThrow: boolean;
}

export interface PendingResult {
  id: string;
  result: ThrowResult;
}

export interface Piece {
  id: string;
  ownerId: PlayerId;
  status: 'waiting' | 'onBoard' | 'finished';
  groupId: string | null;
}

export interface PieceGroup {
  id: string;
  ownerId: PlayerId;
  memberPieceIds: string[];
  /** Full history of on-board nodes visited, oldest first; last entry is the current node. Never empty for a group in state.groups. */
  path: BoardNodeId[];
}

export interface Player {
  id: PlayerId;
  nickname: string;
  photoDataUrl: string | null;
  pieces: Piece[];
}

export type MoveSource =
  | { type: 'group'; groupId: string }
  | { type: 'new'; pieceId: string };

export interface BranchContext {
  pendingResultId: string;
  source: MoveSource;
  /** Original planPath() inputs, kept so the walk can be pure-replayed with an extra choice appended each time. */
  originalStart: BoardNodeId;
  originalCameFrom: BoardNodeId | null;
  originalDistance: number;
  /** Branch choices made so far, in order. */
  choicesSoFar: BoardNodeId[];
  /** Node currently awaiting a player choice, and the options available there (for UI display). */
  branchNode: BoardNodeId;
  options: NodeId[];
}

export type TurnPhase = 'throwing' | 'assigning' | 'branch-choice' | 'game-over';

export interface GameState {
  players: [Player, Player];
  groups: PieceGroup[];
  activePlayer: PlayerId;
  phase: TurnPhase;
  pending: PendingResult[];
  branchContext: BranchContext | null;
  winner: PlayerId | null;
  piecesPerPlayer: number;
}

export interface LegalAssignment {
  pendingResultId: string;
  source: MoveSource;
}

export type GameEvent =
  | { type: 'throw'; playerId: PlayerId; result: ThrowResult; sticks: [Face, Face, Face, Face] }
  | { type: 'catch'; catcherOwnerId: PlayerId; caughtOwnerId: PlayerId; caughtGroupId: string; caughtPieceIds: string[] }
  | { type: 'stack'; ownerId: PlayerId; groupId: string }
  | { type: 'finish'; ownerId: PlayerId; groupId: string; pieceIds: string[] }
  | { type: 'no-legal-move'; discardedResultIds: string[] }
  | { type: 'turn-end'; nextPlayer: PlayerId }
  | { type: 'win'; winnerId: PlayerId };

export interface EngineResult {
  state: GameState;
  events: GameEvent[];
}

export function otherPlayer(id: PlayerId): PlayerId {
  return id === 'p1' ? 'p2' : 'p1';
}

export function getPlayer(state: GameState, id: PlayerId): Player {
  const player = state.players.find((p) => p.id === id);
  if (!player) throw new Error(`Unknown player ${id}`);
  return player;
}

export function getPiece(state: GameState, pieceId: string): Piece {
  for (const player of state.players) {
    const piece = player.pieces.find((p) => p.id === pieceId);
    if (piece) return piece;
  }
  throw new Error(`Unknown piece ${pieceId}`);
}

export function getGroup(state: GameState, groupId: string): PieceGroup {
  const group = state.groups.find((g) => g.id === groupId);
  if (!group) throw new Error(`Unknown group ${groupId}`);
  return group;
}

/** The node a group would retreat to via Back-do, or null if it would leave the board entirely. */
export function getCameFrom(group: PieceGroup): BoardNodeId | null {
  return group.path.length >= 2 ? group.path[group.path.length - 2] : null;
}

export function currentNode(group: PieceGroup): BoardNodeId {
  return group.path[group.path.length - 1];
}
