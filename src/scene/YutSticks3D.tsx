import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Face } from '../engine/types';
import { createStickBackdoFaceTexture, createStickFlatFaceTexture, createStickRoundFaceTexture } from './textures';

interface YutSticks3DProps {
  faces: Face[] | null;
  rolling: boolean;
  position?: [number, number, number];
}

const STICK_EDGE_COLOR = '#d8c19a';
const STICK_LENGTH = 1.3;
const STICK_THICKNESS = 0.14;
const STICK_WIDTH = 0.34;
const SETTLE_HEIGHT = STICK_THICKNESS / 2;
const SCATTER_RADIUS = 1.85;
// Below this center-to-center distance, two sticks visibly clip through each other at some
// relative angle — close to STICK_LENGTH (both ends-on) without being so conservative that 4
// sticks can't fit in the scatter radius.
const MIN_STICK_SEPARATION = 1.15;
const MAX_PLACEMENT_ATTEMPTS = 80;

/** Tight standing bundle, used before the first throw and while the sticks are mid-toss. */
const BUNDLE_TARGETS: [number, number][] = [-0.75, -0.25, 0.25, 0.75].map((x) => [x * 0.47, 0]);

function randomScatterTarget(): [number, number] {
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.3 + Math.random() * SCATTER_RADIUS;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

/** Picks `count` scatter targets that all keep at least MIN_STICK_SEPARATION apart, so the
 * sticks land visibly scattered instead of clipping through one another. Falls back to whatever
 * the last attempt was if it can't find a fully-clear spot within the attempt budget. */
function randomScatterTargets(count: number): [number, number][] {
  const targets: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    let candidate = randomScatterTarget();
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const tooClose = targets.some(([tx, tz]) => Math.hypot(candidate[0] - tx, candidate[1] - tz) < MIN_STICK_SEPARATION);
      if (!tooClose) break;
      candidate = randomScatterTarget();
    }
    targets.push(candidate);
  }
  return targets;
}

function Stick({
  face,
  rolling,
  target,
  topTexture,
  bottomTexture,
}: {
  face: Face | null;
  rolling: boolean;
  target: [number, number];
  topTexture: THREE.Texture;
  bottomTexture: THREE.Texture;
}) {
  const ref = useRef<THREE.Group>(null);
  const spinSeed = useMemo(() => Math.random() * 10, []);
  const yaw = useMemo(() => Math.random() * Math.PI * 2, [target]);
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
      const arc = Math.max(0, 0.85 - elapsed.current * 1.1);
      const bounce = Math.abs(Math.sin(node.rotation.x * 1.7)) * 0.25;
      node.position.y = SETTLE_HEIGHT + arc + bounce;
      const lerpSpeed = Math.min(1, delta * 3);
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
      node.position.y += (SETTLE_HEIGHT - node.position.y) * settleSpeed;
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
 * a coin flip, rather than one standing upright. Three show a plain back when round-side-up; the
 * designated back-do stick shows a blue return-arrow mark on its back instead.
 */
export function YutSticks3D({ faces, rolling, position = [0, 0, -0.4] }: YutSticks3DProps) {
  const [targets, setTargets] = useState<[number, number][]>(BUNDLE_TARGETS);
  const wasRolling = useRef(false);

  useEffect(() => {
    if (rolling && !wasRolling.current) {
      setTargets(randomScatterTargets(4));
    }
    wasRolling.current = rolling;
  }, [rolling]);

  const flatTexture = useMemo(() => createStickFlatFaceTexture(), []);
  const roundTexture = useMemo(() => createStickRoundFaceTexture(), []);
  const backdoTexture = useMemo(() => createStickBackdoFaceTexture(), []);

  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <Stick
          key={i}
          face={faces ? faces[i] : null}
          rolling={rolling}
          target={targets[i]}
          topTexture={flatTexture}
          bottomTexture={i === 0 ? backdoTexture : roundTexture}
        />
      ))}
    </group>
  );
}
