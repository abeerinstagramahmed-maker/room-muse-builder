import { RoomDimensions } from '@/types/studio';

export interface NotchRect { x0: number; x1: number; z0: number; z1: number }

export function notchRect(room: RoomDimensions): NotchRect | null {
  const n = room.notch;
  if (!n || n.width <= 0 || n.depth <= 0) return null;
  const width = Math.min(n.width, room.width - 2);
  const depth = Math.min(n.depth, room.depth - 2);
  if (width <= 0 || depth <= 0) return null;
  return { x0: room.width / 2 - width, x1: room.width / 2, z0: -room.depth / 2, z1: -room.depth / 2 + depth };
}

export function floorArea(room: RoomDimensions) {
  const n = notchRect(room);
  return Math.round(room.width * room.depth - (n ? (n.x1 - n.x0) * (n.z1 - n.z0) : 0));
}

export function clampToFloor(x: number, z: number, room: RoomDimensions, half: [number, number] = [0, 0]): [number, number] {
  const hx = Math.min(half[0], room.width / 2);
  const hz = Math.min(half[1], room.depth / 2);
  let cx = Math.min(room.width / 2 - hx, Math.max(-room.width / 2 + hx, x));
  let cz = Math.min(room.depth / 2 - hz, Math.max(-room.depth / 2 + hz, z));
  const n = notchRect(room);
  if (n && cx + hx > n.x0 && cz - hz < n.z1) {
    const pushX = cx + hx - n.x0;
    const pushZ = n.z1 - (cz - hz);
    if (pushX < pushZ) cx -= pushX; else cz += pushZ;
  }
  return [cx, cz];
}
