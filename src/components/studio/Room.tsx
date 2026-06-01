import { useMemo } from 'react';
import * as THREE from 'three';
import { useStudioStore } from '@/stores/studioStore';
import { getFlooring } from '@/lib/studioConstants';
import { WallId } from '@/types/studio';

/**
 * Renders the room shell: floor, ceiling and four independently coloured walls.
 * Geometry is derived live from room dimensions so it regenerates on change.
 */
export function Room() {
  const room = useStudioStore((s) => s.room);
  const wallColors = useStudioStore((s) => s.wallColors);
  const flooringId = useStudioStore((s) => s.flooringId);
  const selectedWall = useStudioStore((s) => s.selectedWall);
  const selectWall = useStudioStore((s) => s.selectWall);

  const flooring = getFlooring(flooringId);
  const { width: w, depth: d, height: h } = room;

  const halfW = w / 2;
  const halfD = d / 2;

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: flooring.color,
        roughness: flooring.roughness,
        metalness: 0.05,
      }),
    [flooring.color, flooring.roughness],
  );

  const handleWallClick = (e: any, wall: WallId) => {
    e.stopPropagation();
    selectWall(wall);
  };

  const wall = (id: WallId) => ({
    color: wallColors[id],
    onClick: (e: any) => handleWallClick(e, id),
  });

  const emissiveFor = (id: WallId) =>
    selectedWall === id ? new THREE.Color('#3b82f6') : new THREE.Color('#000000');

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        material={floorMat}
      >
        <planeGeometry args={[w, d]} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#f4f4f5" side={THREE.DoubleSide} />
      </mesh>

      {/* North wall (-Z) */}
      <mesh position={[0, h / 2, -halfD]} {...wall('north')}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          color={wallColors.north}
          emissive={emissiveFor('north')}
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* South wall (+Z) */}
      <mesh position={[0, h / 2, halfD]} rotation={[0, Math.PI, 0]} {...wall('south')}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          color={wallColors.south}
          emissive={emissiveFor('south')}
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* West wall (-X) */}
      <mesh position={[-halfW, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} {...wall('west')}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial
          color={wallColors.west}
          emissive={emissiveFor('west')}
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* East wall (+X) */}
      <mesh position={[halfW, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} {...wall('east')}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial
          color={wallColors.east}
          emissive={emissiveFor('east')}
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
