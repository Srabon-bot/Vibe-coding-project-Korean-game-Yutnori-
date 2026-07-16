import type { BoardNodeId, InnerArmId, NodeId, OuterArmId } from './types';

const PERIMETER_ORDER: BoardNodeId[] = [
  'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
  'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19',
];

const CORNER_IDS = new Set<BoardNodeId>(['p0', 'p5', 'p10', 'p15']);
const OUTER_ARM_IDS = new Set<BoardNodeId>(['d0a', 'd5a', 'd10a', 'd15a']);
const INNER_ARM_IDS = new Set<BoardNodeId>(['d0b', 'd5b', 'd10b', 'd15b']);
const DIAGONAL_ARM_IDS = new Set<BoardNodeId>([...OUTER_ARM_IDS, ...INNER_ARM_IDS]);

export function isCorner(node: BoardNodeId): boolean {
  return CORNER_IDS.has(node);
}

/** True for any of the 8 diagonal-shortcut nodes (outer or inner tier). */
export function isDiagonalArm(node: BoardNodeId): node is OuterArmId | InnerArmId {
  return DIAGONAL_ARM_IDS.has(node);
}

function isOuterArm(node: BoardNodeId): node is OuterArmId {
  return OUTER_ARM_IDS.has(node);
}

function isInnerArm(node: BoardNodeId): node is InnerArmId {
  return INNER_ARM_IDS.has(node);
}

/** Maps a corner to the outer diagonal node adjacent to it — the first step onto its shortcut (symmetric naming: pN <-> dNa). */
export function diagonalArmOf(corner: BoardNodeId): OuterArmId {
  const arm = `d${corner.slice(1)}a` as OuterArmId;
  if (!OUTER_ARM_IDS.has(arm)) throw new Error(`${corner} is not a corner`);
  return arm;
}

export function cornerOfArm(arm: OuterArmId): BoardNodeId {
  return `p${arm.slice(1, -1)}` as BoardNodeId;
}

/** The inner node (closer to center) paired with a given outer node. */
function innerOf(outerArm: OuterArmId): InnerArmId {
  return `${outerArm.slice(0, -1)}b` as InnerArmId;
}

/** The outer node (closer to its corner) paired with a given inner node. */
function outerOf(innerArm: InnerArmId): OuterArmId {
  return `${innerArm.slice(0, -1)}a` as OuterArmId;
}

/** Next node along the outer perimeter chain; only valid for p0..p19. p19's forward neighbor is the virtual finish node. */
function nextPerimeter(node: BoardNodeId): NodeId {
  const idx = PERIMETER_ORDER.indexOf(node);
  if (idx === -1) throw new Error(`${node} is not a perimeter node`);
  if (idx === PERIMETER_ORDER.length - 1) return 'finish';
  return PERIMETER_ORDER[idx + 1];
}

/**
 * Exits from the center hub, keyed by the inner diagonal node a group entered through.
 * Excludes any exit that would route back toward a corner already passed in play order,
 * so a piece can never regress relative to an equal-or-better outer route.
 * Reproduces the two standard shortcuts:
 *   p10 -> d10a -> d10b -> center -> d0b -> d0a -> p0 -> finish  (major: 7 edges vs. 10 the long way)
 *   p5  -> d5a  -> d5b  -> center -> d15b -> d15a -> p15         (minor: repositions only)
 */
export const CENTER_EXITS: Record<InnerArmId, InnerArmId[]> = {
  d0b: ['d5b', 'd10b', 'd15b'],
  d5b: ['d0b', 'd10b', 'd15b'],
  d10b: ['d0b', 'd15b'],
  d15b: ['d0b'],
};

/**
 * Returns the legal next node(s) from `node`, given the node the group arrived from
 * (`cameFrom === null` means the group is leaving `waiting` for the very first time).
 * More than one option means a real branch requiring a player choice.
 */
export function getNextStepOptions(node: BoardNodeId, cameFrom: BoardNodeId | null): NodeId[] {
  if (node === 'p0') {
    // Arriving via the major shortcut always completes the lap; a fresh piece leaving
    // start may not cut through the center on its very first move (per house rule).
    return cameFrom === 'd0a' ? ['finish'] : ['p1'];
  }

  if (node === 'p19') {
    return ['finish'];
  }

  if (isCorner(node)) {
    const arm = diagonalArmOf(node);
    if (cameFrom === arm) return [nextPerimeter(node)];
    return [nextPerimeter(node), arm];
  }

  if (isOuterArm(node)) {
    const corner = cornerOfArm(node);
    return cameFrom === corner ? [innerOf(node)] : [corner];
  }

  if (isInnerArm(node)) {
    const outer = outerOf(node);
    return cameFrom === outer ? ['center'] : [outer];
  }

  if (node === 'center') {
    if (cameFrom === null || !isInnerArm(cameFrom)) {
      throw new Error('center must always be entered via an inner diagonal node');
    }
    return CENTER_EXITS[cameFrom];
  }

  return [nextPerimeter(node)];
}
