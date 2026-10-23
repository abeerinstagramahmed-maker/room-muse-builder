import { PlacedFurniture, RoomDimensions } from '@/types/studio';
import { clampToFloor, notchRect } from './roomLayout';

const GAP = 0.05;

interface WallCandidate { distance: number; position: [number, number]; rotationY: number }

/** Rotates an item so its back faces the nearest wall and pushes it flush against it. */
export function alignToNearestWall(item: PlacedFurniture, room: RoomDimensions): { position: [number, number, number]; rotationY: number } {
  const [x, , z] = item.position;
  const halfD = (item.size[2] * item.scale) / 2;
  const halfW = (item.size[0] * item.scale) / 2;
  const W = room.width / 2;
  const D = room.depth / 2;
  const candidates: WallCandidate[] = [
    { distance: z + D, position: [x, -D + halfD + GAP], rotationY: 0 },
    { distance: D - z, position: [x, D - halfD - GAP], rotationY: Math.PI },
    { distance: W - x, position: [W - halfD - GAP, z], rotationY: -Math.PI / 2 },
    { distance: x + W, position: [-W + halfD + GAP, z], rotationY: Math.PI / 2 },
  ];
  const n = notchRect(room);
  if (n) {
    if (z >= n.z0 && z <= n.z1 && x < n.x0) candidates.push({ distance: n.x0 - x, position: [n.x0 - halfD - GAP, z], rotationY: -Math.PI / 2 });
    if (x >= n.x0 && x <= n.x1 && z > n.z1) candidates.push({ distance: z - n.z1, position: [x, n.z1 + halfD + GAP], rotationY: 0 });
  }
  const best = candidates.reduce((a, b) => (b.distance < a.distance ? b : a));
  const sideways = Math.abs(Math.sin(best.rotationY)) > 0.5;
  const half: [number, number] = sideways ? [halfD, halfW] : [halfW, halfD];
  const [cx, cz] = clampToFloor(best.position[0], best.position[1], room, half);
  return { position: [cx, item.position[1], cz], rotationY: best.rotationY };
}

export interface SnapResult { x: number; z: number; guideX: number | null; guideZ: number | null }

/** Magnetically aligns an item's center with nearby floor items' centers on either axis. */
export function snapToNeighbors(x: number, z: number, selfId: string, others: PlacedFurniture[], threshold = 0.35): SnapResult {
  let bestX: number | null = null;
  let bestZ: number | null = null;
  let dx = threshold;
  let dz = threshold;
  for (const o of others) {
    if (o.instanceId === selfId || o.mountType === 'wall') continue;
    const ex = Math.abs(o.position[0] - x);
    const ez = Math.abs(o.position[2] - z);
    if (ex < dx) { dx = ex; bestX = o.position[0]; }
    if (ez < dz) { dz = ez; bestZ = o.position[2]; }
  }
  return { x: bestX ?? x, z: bestZ ?? z, guideX: bestX, guideZ: bestZ };
}
