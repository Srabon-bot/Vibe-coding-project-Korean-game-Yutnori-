import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Face } from '../engine/types';
import { createStickBackdoFaceTexture, createStickBlankFaceTexture, createStickCrossMarkTexture } from './textures';

interface YutSticks3DProps {
  faces: Face[] | null;
  rolling: boolean;
  position?: [number, number, number];
}

const STICK_EDGE_COLOR = '#d8c19a';
const STICK_LENGTH = 1.95;
const STICK_THICKNESS = 0.21;
const STICK_WIDTH = 0.51;
const SETTLE_HEIGHT = STICK_THICKNESS / 2;
// Covers almost the full board (base is ~10.5 across, so half-extent ~5.25) minus half a
// stick-length of margin so a stick lying at any angle still stays on the board.
const SCATTER_RADIUS = 3.6;
// Two landing spots closer than this (center-to-center) count as "the same spot" — close enough
// that real sticks would land on top of one another rather than clipping through flat ground.
const STACK_OVERLAP_RADIUS = 0.675;
const STACK_GAP = 0.03;

/** Tight standing bundle, used before the first throw and while the sticks are mid-toss. */
const BUNDLE_TARGETS: [number, number][] = [-0.75, -0.25, 0.25, 0.75].map((x) => [x * 0.675, 0]);
const BUNDLE_HEIGHTS: number[] = BUNDLE_TARGETS.map(() => SETTLE_HEIGHT);

/** Real thrown sticks can land anywhere, clustered or spread out, touching or not — no rule
 * forces them apart or together, so this is pure unconstrained randomness across the board. */
function randomScatterTarget(): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * SCATTER_RADIUS;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function randomScatterTargets(count: number): [number, number][] {
  return Array.from({ length: count }, randomScatterTarget);
}

/** For each target, if it lands on/near an earlier one, its resting height stacks on top of that
 * stick instead of sinking to the same floor height and clipping through it — like a real stick
 * landing on a pile. Processes in array order so a 3-deep pile stacks consistently. */
function computeStackedHeights(targets: [number, number][]): number[] {
  const heights: number[] = [];
  for (let i = 0; i < targets.length; i++) {
    let height = SETTLE_HEIGHT;
    for (let j = 0; j < i; j++) {
      const dist = Math.hypot(targets[i][0] - targets[j][0], targets[i][1] - targets[j][1]);
      if (dist < STACK_OVERLAP_RADIUS) {
        height = Math.max(height, heights[j] + STICK_THICKNESS + STACK_GAP);
      }
    }
    heights.push(height);
  }
  return heights;
}

function Stick({
  face,
  rolling,
  target,
  settleHeight,
  topTexture,
  bottomTexture,
}: {
  face: Face | null;
  rolling: boolean;
  target: [number, number];
  settleHeight: number;
  topTexture: THREE.Texture;
  bottomTexture: THREE.Texture;
}) {
  const ref = useRef<THREE.Group>(null);
  const spinSeed = useMemo(() => Math.random() * 10, []);
  const yaw = useMemo(() => Math.random() * Math.PI * 2, [target]);
  // Per-stick randomness so a throw looks like several independent sticks tumbling rather than
  // one synchronized animation — each one arcs, falls, and travels to its landing spot at its
  // own slightly different rate.
  const arcHeight = useMemo(() => 0.7 + Math.random() * 0.7, [target]);
  const fallRate = useMemo(() => 0.85 + Math.random() * 0.5, [target]);
  const bounceStrength = useMemo(() => 0.15 + Math.random() * 0.22, [target]);
  const travelRate = useMemo(() => 2 + Math.random() * 2.2, [target]);
  const elapsed = useRef(0);

  useEffect(() => {
    if (rolling) elapsed.current = 0;
  }, [rolling]);

  useFrame((_, delta) => {
    const node = ref.current;
    if (!node) return;
    if (rolling) {
      elapsed.current += delta;
      node.rotation.x += delta * (4 + spinSeed);
      node.rotation.z += delta * (3 + spinSeed * 0.7);
      const arc = Math.max(0, arcHeight - elapsed.current * fallRate);
      const bounce = Math.abs(Math.sin(node.rotation.x * 1.7)) * bounceStrength;
      node.position.y = settleHeight + arc + bounce;
      const lerpSpeed = Math.min(1, delta * travelRate);
      node.position.x += (target[0] - node.position.x) * lerpSpeed;
      node.position.z += (target[1] - node.position.z) * lerpSpeed;
    } else {
      // Lying flat is rotation.x = 0 (top face up) or PI (rolled over, bottom face up) —
      // the stick never "stands"; it always lies flat, just flipped like a coin. Tumbling can
      // accumulate several full spins on rotation.x/z, so re-express each as the equivalent
      // angle within one half-turn of its target before lerping — otherwise the settle has to
      // visually unwind every accumulated spin, which can take the better part of a second and
      // looks like the stick is still standing/spinning instead of settling flat.
      const targetX = face === 'round' ? Math.PI : 0;
      node.rotation.x = targetX + THREE.MathUtils.euclideanModulo(node.rotation.x - targetX + Math.PI, Math.PI * 2) - Math.PI;
      node.rotation.z = THREE.MathUtils.euclideanModulo(node.rotation.z + Math.PI, Math.PI * 2) - Math.PI;
      const settleSpeed = Math.min(1, delta * 8);
      node.rotation.x += (targetX - node.rotation.x) * settleSpeed;
      node.rotation.z += (0 - node.rotation.z) * settleSpeed;
      node.position.y += (settleHeight - node.position.y) * settleSpeed;
      node.position.x += (target[0] - node.position.x) * settleSpeed;
      node.position.z += (target[1] - node.position.z) * settleSpeed;
    }
  });

  return (
    <group ref={ref} position={[target[0], 0.3, target[1]]}>
      <mesh castShadow rotation={[0, yaw, 0]}>
        <boxGeometry args={[STICK_LENGTH, STICK_THICKNESS, STICK_WIDTH]} />
        <meshStandardMaterial attach="material-0" color={STICK_EDGE_COLOR} roughness={0.65} />
        <meshStandardMaterial attach="material-1" color={STICK_EDGE_COLOR} roughness={0.65} />
        <meshStandardMaterial attach="material-2" map={topTexture} roughness={0.55} />
        <meshStandardMaterial attach="material-3" map={bottomTexture} roughness={0.55} />
        <meshStandardMaterial attach="material-4" color={STICK_EDGE_COLOR} roughness={0.65} />
        <meshStandardMaterial attach="material-5" color={STICK_EDGE_COLOR} roughness={0.65} />
      </mesh>
    </group>
  );
}

/**
 * Four stick meshes: a tight bundle lying flat before/during a throw, tossed with an arc and
 * settling scattered across the board once the result resolves. Every stick always lies flat —
 * the flat/round result is shown by which textured face (top vs. bottom) ends up facing up, like
 * a coin flip, rather than one standing upright. Per the reference rules image, the plain
 * "blank" face is the one that counts toward distance (engine Face 'flat'); the carved "cross"
 * (X-marked) face is the uncounted default (engine Face 'round'). All four share the same cross
 * back; the designated back-do stick instead carries its blue return-arrow mark on its counted
 * (blank) face, since Back-Do only triggers when that stick is the lone one counted (engine:
 * flatCount===1 && sticks[0]==='flat') — marking the cross face would hide the cue exactly when
 * it matters.
 */
export function YutSticks3D({ faces, rolling, position = [0, 0, 0] }: YutSticks3DProps) {
  const [targets, setTargets] = useState<[number, number][]>(BUNDLE_TARGETS);
  const [heights, setHeights] = useState<number[]>(BUNDLE_HEIGHTS);
  const wasRolling = useRef(false);

  useEffect(() => {
    if (rolling && !wasRolling.current) {
      const newTargets = randomScatterTargets(4);
      setTargets(newTargets);
      setHeights(computeStackedHeights(newTargets));
    }
    wasRolling.current = rolling;
  }, [rolling]);

  const crossTexture = useMemo(() => createStickCrossMarkTexture(), []);
  const blankTexture = useMemo(() => createStickBlankFaceTexture(), []);
  const backdoTexture = useMemo(() => createStickBackdoFaceTexture(), []);

  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <Stick
          key={i}
          face={faces ? faces[i] : null}
          rolling={rolling}
          target={targets[i]}
          settleHeight={heights[i]}
          topTexture={i === 0 ? backdoTexture : blankTexture}
          bottomTexture={crossTexture}
        />
      ))}
    </group>
  );
}
