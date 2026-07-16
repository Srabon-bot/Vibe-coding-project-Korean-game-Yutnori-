import type { BoardNodeId, PlayerId } from '../engine/types';

export type Vec3 = [number, number, number];

const HALF = 4;

function lerpSide(fromX: number, fromZ: number, toX: number, toZ: number, index: number): Vec3 {
  const t = index / 5;
  return [fromX + (toX - fromX) * t, 0, fromZ + (toZ - fromZ) * t];
}

const PERIMETER_POSITIONS: Record<string, Vec3> = {};

// Matches the reference board layout (lll.png): home sits at the bottom-left corner (taegeuk),
// and pieces travel bottom-left -> bottom-right -> top-right -> top-left -> back to home. p10
// (the major-shortcut entry corner, diagonally opposite home) lands top-right; p5/p15 land at
// bottom-right/top-left respectively, matching the reference's two shortcut-diagonal arrows.

// Bottom side: p0 (-4,4) -> p5 (4,4)
for (let i = 0; i <= 5; i++) PERIMETER_POSITIONS[`p${i}`] = lerpSide(-HALF, HALF, HALF, HALF, i);
// Right side: p5 (4,4) -> p10 (4,-4)
for (let i = 0; i <= 5; i++) PERIMETER_POSITIONS[`p${5 + i}`] = lerpSide(HALF, HALF, HALF, -HALF, i);
// Top side: p10 (4,-4) -> p15 (-4,-4)
for (let i = 0; i <= 5; i++) PERIMETER_POSITIONS[`p${10 + i}`] = lerpSide(HALF, -HALF, -HALF, -HALF, i);
// Left side: p15 (-4,-4) -> p19 approaching p0 (-4,4), stopping one short (finish sits between p19 and p0)
for (let i = 0; i <= 4; i++) PERIMETER_POSITIONS[`p${15 + i}`] = lerpSide(-HALF, -HALF, -HALF, HALF, i);

const CENTER: Vec3 = [0, 0, 0];

// Two diagonal nodes per corner instead of one, matching the reference board's 2-dots-per-half-
// diagonal: the outer node ('a') sits 1/3 of the way in from the corner, the inner node ('b') 2/3
// of the way in (i.e. nearer the center).
const CORNER_XZ: Record<string, [number, number]> = {
  '0': [-HALF, HALF],
  '5': [HALF, HALF],
  '10': [HALF, -HALF],
  '15': [-HALF, -HALF],
};
const DIAGONAL_POSITIONS: Record<string, Vec3> = {};
for (const [n, [cx, cz]] of Object.entries(CORNER_XZ)) {
  DIAGONAL_POSITIONS[`d${n}a`] = [cx * (2 / 3), 0, cz * (2 / 3)];
  DIAGONAL_POSITIONS[`d${n}b`] = [cx * (1 / 3), 0, cz * (1 / 3)];
}

const BOARD_POSITIONS: Record<BoardNodeId, Vec3> = {
  ...(PERIMETER_POSITIONS as Record<BoardNodeId, Vec3>),
  ...DIAGONAL_POSITIONS,
  center: CENTER,
};

export function getNodePosition(node: BoardNodeId): Vec3 {
  const pos = BOARD_POSITIONS[node];
  if (!pos) throw new Error(`No layout position for node ${node}`);
  return pos;
}

export const ALL_BOARD_NODE_IDS = Object.keys(BOARD_POSITIONS) as BoardNodeId[];

/** Off-board tray positions for waiting/finished pieces, one row per player on either side of the board. */
const TRAY_X: Record<PlayerId, number> = { p1: -HALF - 2.5, p2: HALF + 2.5 };

export function getWaitingSlotPosition(ownerId: PlayerId, index: number): Vec3 {
  return [TRAY_X[ownerId], 0, -HALF + index * 1.4];
}

export function getFinishSlotPosition(ownerId: PlayerId, index: number): Vec3 {
  return [TRAY_X[ownerId], 0, HALF - index * 1.4];
}

/** A stacked group's member pieces sit directly on top of one another, like stacked coins —
 * the piece that arrived first (already occupying the spot) stays on the bottom. */
const PIECE_STACK_HEIGHT = 0.25;

export function getStackOffset(indexInGroup: number): Vec3 {
  return [0, indexInGroup * PIECE_STACK_HEIGHT, 0];
}
