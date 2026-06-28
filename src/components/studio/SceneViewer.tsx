import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { getFlooring } from '@/lib/studioConstants';
import type { SceneData } from '@/types/studio';

/** Lightweight, read-only 3D renderer for a serialized scene (shares/gallery). */
export function SceneViewer({ scene }: { scene: SceneData }) {
  const room = scene.room ?? { width: 15, depth: 20, height: 9 };
  const wallColors = scene.wallColors ?? {
    north: '#f1f0ee',
    south: '#f1f0ee',
    east: '#f1f0ee',
    west: '#f1f0ee',
  };
  const flooring = getFlooring(scene.flooringId ?? 'light-oak');
  const furniture = scene.furniture ?? [];

  const { width: w, depth: d, height: h } = room;
  const halfW = w / 2;
  const halfD = d / 2;
  const dist = useRef(Math.max(w, d) * 1.1 + 8);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [dist.current, dist.current * 0.8, dist.current], fov: 45 }}
    >
      <color attach="background" args={['#f1f0ee']} />
      <hemisphereLight intensity={0.6} groundColor="#b9b4ab" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 18, 8]} intensity={1.1} castShadow />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={flooring.color} roughness={flooring.roughness} />
      </mesh>
      {/* North wall */}
      <mesh position={[0, h / 2, -halfD]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={wallColors.north} side={THREE.DoubleSide} />
      </mesh>
      {/* West wall */}
      <mesh position={[-halfW, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={wallColors.west} side={THREE.DoubleSide} />
      </mesh>
      {/* East wall */}
      <mesh position={[halfW, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={wallColors.east} side={THREE.DoubleSide} />
      </mesh>

      {furniture.map((f, i) => {
        const [sw, sh, sd] = f.size ?? [2, 2, 2];
        const [px, py, pz] = f.position ?? [0, 0, 0];
        const sc = f.scale ?? 1;
        return (
          <mesh
            key={f.instanceId ?? i}
            position={[px, (py || 0) + (sh * sc) / 2, pz]}
            rotation={[0, f.rotationY ?? 0, 0]}
            castShadow
          >
            <boxGeometry args={[sw * sc, sh * sc, sd * sc]} />
            <meshStandardMaterial color="#c8b9a6" roughness={0.7} />
          </mesh>
        );
      })}

      <Grid
        args={[80, 80]}
        cellSize={1}
        cellColor="#d1d5db"
        sectionSize={5}
        sectionColor="#9ca3af"
        fadeDistance={60}
        infiniteGrid
        position={[0, 0.01, 0]}
      />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  );
}
