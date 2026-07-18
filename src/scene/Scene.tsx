import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { Face } from '../engine/types';
import { useT } from '../i18n/useT';
import { useGameStore } from '../store/gameStore';
import { STICK_SETTLE_MS } from '../ui/timing';
import { Board3D } from './Board3D';
import { MovePreview3D } from './MovePreview3D';
import { PLAYER_COLORS } from './Piece3D';
import { Pieces3D } from './Pieces3D';
import { VictoryEffect } from './VictoryEffect';
import { YutSticks3D } from './YutSticks3D';

/** Keeps the whole board framed in view as the canvas's aspect ratio changes (e.g. portrait mobile). */
function ResponsiveCameraRig() {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = width / height;
    // Narrower (portrait) viewports get a steeper, more top-down angle plus a bit more
    // distance, so the board's width still fits and less of the frame is wasted on empty sky.
    const t = aspect >= 1 ? 0 : Math.min(1, (1 - aspect) / 0.6);
    const elevation = THREE.MathUtils.lerp(10, 13, t);
    const forward = THREE.MathUtils.lerp(9.5, 4, t);
    const distanceScale = THREE.MathUtils.lerp(1, 1.7, t);
    const direction = new THREE.Vector3(0, elevation, forward).normalize();
    camera.position.copy(direction.multiplyScalar(13.5 * distanceScale));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);

  return null;
}

function SceneContent() {
  const game = useGameStore((s) => s.game);
  const lastEvents = useGameStore((s) => s.lastEvents);
  const [rolling, setRolling] = useState(false);
  const [faces, setFaces] = useState<Face[] | null>(null);
  const t = useT();

  useEffect(() => {
    const throwEvent = lastEvents.find((e) => e.type === 'throw');
    if (!throwEvent || throwEvent.type !== 'throw') return;
    setRolling(true);
    const settle = setTimeout(() => {
      setFaces(throwEvent.sticks);
      setRolling(false);
    }, STICK_SETTLE_MS);
    return () => clearTimeout(settle);
  }, [lastEvents]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 9, 4]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 5, -6]} intensity={0.3} />
      <ResponsiveCameraRig />
      <Board3D />
      <Pieces3D game={game} />
      <MovePreview3D />
      <YutSticks3D faces={faces} rolling={rolling} />
      {game.phase === 'game-over' && game.winner && (
        <VictoryEffect
          label={t('win.banner3d', { nickname: game.players.find((p) => p.id === game.winner)!.nickname })}
          color={PLAYER_COLORS[game.winner]}
        />
      )}
      <OrbitControls enablePan={false} minDistance={7} maxDistance={32} maxPolarAngle={Math.PI / 2.15} />
    </>
  );
}

export function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 10, 9.5], fov: 45 }} gl={{ alpha: true }}>
      {/* No opaque scene background here (deliberately) — leaves the canvas transparent so the
          page's ornamental frame background (global.css) shows through around the board. */}
      <fog attach="fog" args={['#1b140f', 22, 46]} />
      <SceneContent />
    </Canvas>
  );
}
