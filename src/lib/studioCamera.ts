import { RoomDimensions, WallId } from '@/types/studio';

export type CameraView = 'dollhouse' | 'top' | 'eye' | 'north' | 'south' | 'east' | 'west';

export function cameraPose(view: CameraView, room: RoomDimensions, aspect = 1) {
  const span = Math.max(room.width, room.depth, room.height);
  const distance = span * 1.7 / Math.min(aspect, 1);
  const target: [number, number, number] = [0, view === 'top' ? 0 : room.height * 0.35, 0];
  const positions: Record<CameraView, [number, number, number]> = {
    dollhouse: [distance * 0.7, distance * 0.75, distance * 0.7],
    top: [0, distance, 0.001],
    eye: [0, Math.min(5.5, room.height - 0.5), room.depth / 2 - 1.5],
    north: [0, target[1], -distance],
    south: [0, target[1], distance],
    east: [distance, target[1], 0],
    west: [-distance, target[1], 0],
  };
  if (view === 'eye') return { position: positions.eye, target: [0, positions.eye[1], -room.depth / 2] as [number, number, number] };
  return { position: positions[view], target };
}

export function isWallCutAway(wall: WallId, camera: { x: number; z: number }, room: RoomDimensions) {
  switch (wall) {
    case 'north': return camera.z < -room.depth / 2 - 0.05;
    case 'south': return camera.z > room.depth / 2 + 0.05;
    case 'east': return camera.x > room.width / 2 + 0.05;
    case 'west': return camera.x < -room.width / 2 - 0.05;
  }
}