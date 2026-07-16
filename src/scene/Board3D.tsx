import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { isCorner, isDiagonalArm } from '../engine/board';
import type { BoardNodeId } from '../engine/types';
import { ALL_BOARD_NODE_IDS, getNodePosition, type Vec3 } from './boardLayout';
import { createCenterEmblemTexture, createGrainTexture, createTaegeukTexture, createTasselTexture } from './textures';

/**
 * The two full shortcut diagonals, each spanning corner-to-corner through the center
 * (matches the two real shortcuts: the major p10->p0 and the minor p5->p15). Drawn as plain
 * dashed lines with no direction arrows — the shortcut can be entered/exited from either
 * side depending on legal moves (see board.ts's CENTER_EXITS), so no single arrow direction
 * applies to the line itself.
 */
const FULL_DIAGONALS: BoardNodeId[][] = [
  ['p10', 'd10a', 'd10b', 'center', 'd0b', 'd0a', 'p0'],
  ['p5', 'd5a', 'd5b', 'center', 'd15b', 'd15a', 'p15'],
];

const PERIMETER_ORDER: BoardNodeId[] = [
  'p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
  'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19',
];

/** Perimeter order with the closing edge back to the start corner, so the outer loop is a full square. */
const PERIMETER_LOOP: BoardNodeId[] = [...PERIMETER_ORDER, 'p0'];

/** Consecutive-pair segments of a chain, each as [from, to] in travel direction. */
function segmentsOf(chain: BoardNodeId[]): Array<readonly [BoardNodeId, BoardNodeId]> {
  return chain.slice(0, -1).map((n, i) => [n, chain[i + 1]] as const);
}

/** Which decorative roundel each corner gets: the start corner is the taegeuk, the rest get tassel color combos. */
const CORNER_ORNAMENT: Record<string, 'taegeuk' | [string, string, string]> = {
  p0: 'taegeuk',
  p5: ['#b3261e', '#c9a227', '#1e4fb3'],
  p10: ['#1e4fb3', '#c9a227', '#b3261e'],
  p15: ['#c9a227', '#b3261e', '#1e4fb3'],
};

// Apex at -Y (not +Y) so that, after the mesh's Rx(-90deg) flattening rotation below, the tip
// lands on local +Z (which DirectionArrow's lookAt orients toward `to`) rather than -Z (toward
// `from`). Vertex order is mirrored to match so the face normal — and thus visibility from the
// top-down camera — is unchanged.
const ARROW_SHAPE = new THREE.Shape();
ARROW_SHAPE.moveTo(0, -0.13);
ARROW_SHAPE.lineTo(0.055, 0.07);
ARROW_SHAPE.lineTo(-0.055, 0.07);
ARROW_SHAPE.closePath();

function DirectionArrow({ from, to }: { from: Vec3; to: Vec3 }) {
  const { position, quaternion } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y = 0.03;
    const dummy = new THREE.Object3D();
    dummy.position.copy(mid);
    dummy.up.set(0, 1, 0);
    dummy.lookAt(end.x, mid.y, end.z);
    return { position: mid, quaternion: dummy.quaternion.clone() };
  }, [from, to]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[ARROW_SHAPE]} />
        <meshBasicMaterial color="#e8ded0" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function NodeMarker({ node }: { node: BoardNodeId }) {
  const [x, y, z] = getNodePosition(node);
  const corner = isCorner(node);
  const diag = isDiagonalArm(node);
  const isCenter = node === 'center';

  const ornament = corner ? CORNER_ORNAMENT[node] : null;
  const taegeukTexture = useMemo(() => (ornament === 'taegeuk' ? createTaegeukTexture() : null), [ornament]);
  const tasselTexture = useMemo(
    () => (Array.isArray(ornament) ? createTasselTexture(ornament[0], ornament[1], ornament[2]) : null),
    [ornament],
  );
  const emblemTexture = useMemo(() => (isCenter ? createCenterEmblemTexture() : null), [isCenter]);

  const radius = corner ? 0.42 : isCenter ? 0.44 : diag ? 0.22 : 0.19;
  const baseColor = isCenter ? '#c9a227' : '#f4e3c1';
  const map = taegeukTexture ?? tasselTexture ?? undefined;

  return (
    <group position={[x, y + 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color={map ? '#ffffff' : baseColor} map={map} roughness={0.55} />
      </mesh>
      {isCenter && emblemTexture && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[radius * 2, radius * 2]} />
          <meshBasicMaterial map={emblemTexture} transparent />
        </mesh>
      )}
    </group>
  );
}

export function Board3D() {
  const grainTexture = useMemo(() => {
    const tex = createGrainTexture();
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  const perimeterArrowSegments = useMemo(() => segmentsOf(PERIMETER_LOOP), []);

  return (
    <group>
      {/* Wood-tone frame */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[11.6, 0.14, 11.6]} />
        <meshStandardMaterial color="#6b4226" roughness={0.75} />
      </mesh>

      {/* Black lacquer board base */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10.5, 0.1, 10.5]} />
        <meshStandardMaterial color="#1c1712" map={grainTexture} roughness={0.42} metalness={0.08} />
      </mesh>

      {/* Outer perimeter path, closed back to the start corner */}
      <Line points={PERIMETER_LOOP.map((n) => getNodePosition(n))} color="#e8ded0" lineWidth={1.4} transparent opacity={0.7} />

      {/* Shortcut diagonals, each one continuous corner-to-corner span through center */}
      {FULL_DIAGONALS.map((chain, i) => (
        <Line
          key={i}
          points={chain.map((n) => getNodePosition(n))}
          color="#e8ded0"
          lineWidth={1.4}
          transparent
          opacity={0.55}
          dashed
          dashSize={0.15}
          gapSize={0.1}
        />
      ))}

      {perimeterArrowSegments.map(([from, to], i) => (
        <DirectionArrow key={`p-${i}`} from={getNodePosition(from)} to={getNodePosition(to)} />
      ))}

      {ALL_BOARD_NODE_IDS.map((node) => (
        <NodeMarker key={node} node={node} />
      ))}
    </group>
  );
}
