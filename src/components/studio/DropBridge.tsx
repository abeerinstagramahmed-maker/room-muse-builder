import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStudioStore } from '@/stores/studioStore';
import { getDraggedProduct } from '@/lib/catalogDrag';
import { productSize } from '@/hooks/useStudioProducts';
import { mountTypeForCategory } from '@/lib/studioConstants';
import { clampToFloor } from '@/lib/roomLayout';

const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/** Lets catalog cards be dropped straight onto the floor, with a footprint preview under the cursor. */
export function DropBridge() {
  const { gl, camera } = useThree();
  const [ghost, setGhost] = useState<{ x: number; z: number; w: number; d: number } | null>(null);

  useEffect(() => {
    const el = gl.domElement;
    const ray = new THREE.Raycaster();
    const hit = new THREE.Vector3();
    const toFloor = (e: DragEvent) => {
      const r = el.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null;
    };
    const over = (e: DragEvent) => {
      const p = getDraggedProduct();
      if (!p) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      const pt = toFloor(e);
      if (!pt) return;
      const [w, , d] = productSize(p);
      const [x, z] = clampToFloor(pt.x, pt.z, useStudioStore.getState().room, [w / 2, d / 2]);
      setGhost({ x, z, w, d });
    };
    const leave = () => setGhost(null);
    const drop = (e: DragEvent) => {
      const p = getDraggedProduct();
      setGhost(null);
      if (!p) return;
      e.preventDefault();
      const pt = toFloor(e);
      const { room, addFurniture } = useStudioStore.getState();
      const size = productSize(p);
      const base = { productId: p.id, name: p.name, category: p.category, modelUrl: p.modelUrl, rotationY: 0, scale: 1 };
      if (mountTypeForCategory(p.category) === 'wall') {
        const x = Math.max(-room.width / 2 + size[0] / 2, Math.min(room.width / 2 - size[0] / 2, pt?.x ?? 0));
        addFurniture({ ...base, size: [size[0], size[1], 0.15], position: [x, Math.max(2.5, room.height * 0.55), -(room.depth / 2 - 0.12)], mountType: 'wall' });
        return;
      }
      const [x, z] = clampToFloor(pt?.x ?? 0, pt?.z ?? 0, room, [size[0] / 2, size[2] / 2]);
      addFurniture({ ...base, size, position: [x, 0, z], mountType: 'floor' });
    };
    el.addEventListener('dragover', over);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);
    return () => {
      el.removeEventListener('dragover', over);
      el.removeEventListener('dragleave', leave);
      el.removeEventListener('drop', drop);
    };
  }, [gl, camera]);

  if (!ghost) return null;
  return (
    <mesh position={[ghost.x, 0.03, ghost.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ghost.w, ghost.d]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.45} depthWrite={false} />
    </mesh>
  );
}
