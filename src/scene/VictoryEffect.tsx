import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface VictoryEffectProps {
  label: string;
  color: string;
}

const CONFETTI_COLORS = ['#b3261e', '#1e4fb3', '#c9a227', '#3a6b4f', '#f4e3c1'];
const COUNT = 70;

interface Particle {
  x: number;
  z: number;
  y: number;
  speed: number;
  rotSpeed: number;
  color: THREE.Color;
}

function ConfettiParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 9,
        z: (Math.random() - 0.5) * 9,
        y: Math.random() * 9,
        speed: 1.2 + Math.random() * 1.8,
        rotSpeed: (Math.random() - 0.5) * 8,
        color: new THREE.Color(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]),
      })),
    [],
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    particles.forEach((p, i) => {
      p.y -= p.speed * delta;
      if (p.y < 0) p.y = 8 + Math.random() * 2;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.y * p.rotSpeed, p.y * p.rotSpeed * 0.6, p.y * 0.4);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, p.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[0.14, 0.14, 0.02]} />
      <meshStandardMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function PulsingBanner({ label, color }: { label: string; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.06;
    ref.current.scale.set(s, s, s);
  });
  return (
    <group ref={ref} position={[0, 3.2, 0]}>
      <Text fontSize={0.9} color={color} outlineWidth={0.03} outlineColor="#f4e3c1" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

export function VictoryEffect({ label, color }: VictoryEffectProps) {
  return (
    <group>
      <ConfettiParticles />
      <PulsingBanner label={label} color={color} />
    </group>
  );
}
