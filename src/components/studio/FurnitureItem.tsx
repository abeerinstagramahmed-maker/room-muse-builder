import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF, TransformControls } from '@react-three/drei';
import { PlacedFurniture } from '@/types/studio';
import { useStudioStore } from '@/stores/studioStore';

interface Props {
  item: PlacedFurniture;
}

/** Loads and renders a GLB model, falling back to a sized box placeholder. */
function ModelMesh({ item }: Props) {
  const { scene } = useGLTF(item.modelUrl!);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // Normalize the model to the product footprint.
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const target = Math.max(item.size[0], item.size[2]);
    const current = Math.max(size.x, size.z) || 1;
    const fit = target / current;
    c.scale.setScalar(fit);
    return c;
  }, [scene, item.size]);

  return <primitive object={cloned} />;
}

function PlaceholderMesh({ item }: Props) {
  const [w, h, d] = item.size;
  const isWall = item.mountType === 'wall';
  return (
    <mesh position={[0, isWall ? 0 : h / 2, 0]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={isWall ? '#6b7280' : '#b08968'} roughness={0.7} />
    </mesh>
  );
}

export function FurnitureItem({ item }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useStudioStore((s) => s.selectedId);
  const transformMode = useStudioStore((s) => s.transformMode);
  const snapEnabled = useStudioStore((s) => s.snapEnabled);
  const select = useStudioStore((s) => s.select);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const beginHistory = useStudioStore((s) => s.beginHistory);

  const isSelected = selectedId === item.instanceId;
  const isWall = item.mountType === 'wall';

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
        {item.modelUrl ? <ModelMesh item={item} /> : <PlaceholderMesh item={item} />}
      </Suspense>
      {isSelected && !isWall && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(item.size[0], item.size[2]) * 0.6, Math.max(item.size[0], item.size[2]) * 0.7, 48]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );

  if (isSelected) {
    return (
      <TransformControls
        mode={transformMode}
        showY={isWall && transformMode === 'translate'}
        showX={transformMode === 'translate'}
        showZ={transformMode === 'translate'}
        translationSnap={transformMode === 'translate' && snapEnabled ? 0.25 : undefined}
        rotationSnap={transformMode === 'rotate' && snapEnabled ? Math.PI / 24 : undefined}
        onMouseDown={beginHistory}
        onMouseUp={commitTransform}
        onObjectChange={commitTransform}
      >
        {content}
      </TransformControls>
    );
  }

  return content;
}
