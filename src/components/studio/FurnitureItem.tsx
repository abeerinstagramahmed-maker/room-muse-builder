import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGLTF, TransformControls } from '@react-three/drei';
import { PlacedFurniture } from '@/types/studio';
import { useStudioStore } from '@/stores/studioStore';
import { ProceduralFurniture } from './ProceduralFurniture';
import { clampToFloor } from '@/lib/roomLayout';
import { resolveModelUrl } from '@/lib/curatedModels';
import { getFinish } from '@/lib/finishes';
import { snapToNeighbors } from '@/lib/placement';

interface Props {
  item: PlacedFurniture;
}

/** Loads and renders a GLB model, falling back to a sized box placeholder. */
function ModelMesh({ item, url }: Props & { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const finish = getFinish(item.finish);
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((m) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        if (finish && mat.color) {
          mat.color.lerp(new THREE.Color(finish.color), 0.75);
          mat.roughness = finish.roughness;
          mat.metalness = finish.metalness;
        }
        return mat;
      });
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const fit = Math.max(item.size[0], item.size[2]) / (Math.max(size.x, size.z) || 1);
    const center = box.getCenter(new THREE.Vector3());
    const wrapper = new THREE.Group();
    c.position.set(-center.x, -box.min.y, -center.z);
    wrapper.add(c);
    wrapper.scale.setScalar(fit);
    return wrapper;
  }, [scene, item.size, item.finish]);

  return <primitive object={cloned} />;
}

function PlaceholderMesh({ item }: Props) {
  return <ProceduralFurniture item={item} />;
}

export function FurnitureItem({ item }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useStudioStore((s) => s.selectedId);
  const transformMode = useStudioStore((s) => s.transformMode);
  const snapEnabled = useStudioStore((s) => s.snapEnabled);
  const snapSize = useStudioStore((s) => s.snapSize);
  const select = useStudioStore((s) => s.select);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const beginHistory = useStudioStore((s) => s.beginHistory);

  const [guides, setGuides] = useState<{ x: number | null; z: number | null }>({ x: null, z: null });
  const modelUrl = resolveModelUrl(item);
  const isSelected = selectedId === item.instanceId;
  const isWall = item.mountType === 'wall';
  const isColliding = useStudioStore(
    (s) => s.collisionEnabled && s.collidingIds.includes(item.instanceId),
  );

  // Keep the group transform in sync with store when not actively editing.
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(...item.position);
    groupRef.current.rotation.set(0, item.rotationY, 0);
    groupRef.current.scale.setScalar(item.scale);
  }, [item.position, item.rotationY, item.scale]);

  const commitTransform = () => {
    const g = groupRef.current;
    if (!g) return;
    // Floor items stay on the ground; wall items keep their height.
    const y = isWall ? g.position.y : Math.max(0, g.position.y);
    g.position.y = y;
    if (!isWall) {
      const { room, furniture, snapEnabled: snap } = useStudioStore.getState();
      if (snap && transformMode === 'translate') {
        const r = snapToNeighbors(g.position.x, g.position.z, item.instanceId, furniture);
        g.position.x = r.x;
        g.position.z = r.z;
        setGuides({ x: r.guideX, z: r.guideZ });
      }
      const [x, z] = clampToFloor(g.position.x, g.position.z, room, [item.size[0] * g.scale.x / 2, item.size[2] * g.scale.x / 2]);
      g.position.x = x;
      g.position.z = z;
    }
    updateFurniture(item.instanceId, {
      position: [g.position.x, y, g.position.z],
      rotationY: g.rotation.y,
      scale: g.scale.x,
    });
  };

  const content = (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        select(item.instanceId);
      }}
    >
      <Suspense fallback={<PlaceholderMesh item={item} />}>
        {modelUrl ? <ModelMesh item={item} url={modelUrl} /> : <PlaceholderMesh item={item} />}
      </Suspense>
      {isSelected && !isWall && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(item.size[0], item.size[2]) * 0.6, Math.max(item.size[0], item.size[2]) * 0.7, 48]} />
          <meshBasicMaterial color={isColliding ? '#ef4444' : '#3b82f6'} transparent opacity={0.9} />
        </mesh>
      )}
      {isColliding && (
        <mesh position={[0, item.size[1] / 2, 0]}>
          <boxGeometry args={[item.size[0] * item.scale, item.size[1] * item.scale, item.size[2] * item.scale]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      )}
    </group>
  );

  const room = useStudioStore((s) => s.room);
  const guideLines = isSelected && (guides.x !== null || guides.z !== null) && (
    <group>
      {guides.x !== null && <mesh position={[guides.x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.04, room.depth]} /><meshBasicMaterial color="#f59e0b" /></mesh>}
      {guides.z !== null && <mesh position={[0, 0.03, guides.z]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[room.width, 0.04]} /><meshBasicMaterial color="#f59e0b" /></mesh>}
    </group>
  );

  if (isSelected) {
    return (
      <>
      {guideLines}
      <TransformControls
        mode={transformMode}
        showY={isWall && transformMode === 'translate'}
        showX={transformMode === 'translate'}
        showZ={transformMode === 'translate'}
        translationSnap={transformMode === 'translate' && snapEnabled ? snapSize : undefined}
        rotationSnap={transformMode === 'rotate' && snapEnabled ? Math.PI / 24 : undefined}
        onMouseDown={beginHistory}
        onMouseUp={() => { commitTransform(); setGuides({ x: null, z: null }); }}
        onObjectChange={commitTransform}
      >
        {content}
      </TransformControls>
      </>
    );
  }

  return content;
}
