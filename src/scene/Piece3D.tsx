import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { PlayerId } from '../engine/types';
import type { Vec3 } from './boardLayout';

export const PLAYER_COLORS: Record<PlayerId, string> = {
  p1: '#b3261e',
  p2: '#1e4fb3',
};

function PhotoBillboard({ url }: { url: string }) {
  const texture = useTexture(url);
  return (
    <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.22, 24]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

interface AnimatedPieceProps {
  /**
   * The full sequence of positions this piece should currently be considered to pass through,
   * in order (e.g. a waiting/finished piece has a single-element array; an on-board piece has
   * one entry per node in its group's path). The component tracks how far along this sequence
   * it has already animated and only walks forward through newly appended entries, so growing
   * the array mid-game continues the walk rather than restarting it. A *shorter* array (Back-do,
   * being caught, finishing) is treated as "head straight to the new final entry."
   */
  waypoints: Vec3[];
  ownerId: PlayerId;
  photoDataUrl?: string | null;
}

/**
 * A single piece mesh that walks toward `waypoints` one node at a time instead of snapping,
 * so moves visibly follow the board path (including shortcuts) rather than cutting a straight
 * line across the board. Must be keyed by the stable piece id (not group id, which churns
 * across catches/stacks) so this instance persists for the piece's whole lifetime and the
 * walk has continuity.
 */
export function AnimatedPiece({ waypoints, ownerId, photoDataUrl }: AnimatedPieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialized = useRef(false);
  const nextIndexRef = useRef(0);
  const color = PLAYER_COLORS[ownerId];

  useFrame((_, delta) => {
    const node = groupRef.current;
    if (!node || waypoints.length === 0) return;

    if (!initialized.current) {
      const last = waypoints[waypoints.length - 1];
      node.position.set(...last);
      nextIndexRef.current = waypoints.length - 1;
      initialized.current = true;
      return;
    }

    nextIndexRef.current = Math.min(nextIndexRef.current, waypoints.length - 1);
    const [tx, ty, tz] = waypoints[nextIndexRef.current];
    const speed = Math.min(1, delta * 7);
    node.position.x += (tx - node.position.x) * speed;
    node.position.y += (ty - node.position.y) * speed;
    node.position.z += (tz - node.position.z) * speed;

    const dist = Math.hypot(tx - node.position.x, ty - node.position.y, tz - node.position.z);
    if (dist < 0.03 && nextIndexRef.current < waypoints.length - 1) {
      nextIndexRef.current += 1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.24, 24]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>
      {photoDataUrl && <PhotoBillboard url={photoDataUrl} />}
    </group>
  );
}
