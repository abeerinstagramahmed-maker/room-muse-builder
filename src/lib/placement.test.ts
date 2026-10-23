import { describe, expect, it } from 'vitest';
import { alignToNearestWall, snapToNeighbors } from './placement';
import { PlacedFurniture } from '@/types/studio';

const room = { width: 10, depth: 10, height: 8 };
const item = (id: string, x: number, z: number): PlacedFurniture => ({
  instanceId: id, productId: id, name: id, modelUrl: null, size: [4, 3, 2], position: [x, 0, z], rotationY: 0.3, scale: 1,
});

describe('Align to nearest wall', () => {
  it('backs an item flush against the north wall', () => {
    const r = alignToNearestWall(item('a', 0, -3), room);
    expect(r.rotationY).toBe(0);
    expect(r.position[2]).toBeCloseTo(-5 + 1 + 0.05);
  });
  it('turns an item to face away from the east wall', () => {
    const r = alignToNearestWall(item('a', 4, 0), room);
    expect(r.rotationY).toBeCloseTo(-Math.PI / 2);
    expect(r.position[0]).toBeCloseTo(5 - 1 - 0.05);
  });
  it('uses the inner wall of an L-shaped cut-out', () => {
    const l = { ...room, notch: { width: 4, depth: 4 } };
    const r = alignToNearestWall(item('a', 3, 0), l);
    expect(r.rotationY).toBe(0);
    expect(r.position[2]).toBeCloseTo(-1 + 1 + 0.05);
  });
});

describe('Neighbor snapping', () => {
  it('aligns centers within 0.35 ft', () => {
    const r = snapToNeighbors(1.2, 3, 'a', [item('b', 1, -2)]);
    expect(r.x).toBe(1);
    expect(r.guideX).toBe(1);
    expect(r.z).toBe(3);
  });
  it('leaves distant items alone', () => {
    const r = snapToNeighbors(2, 3, 'a', [item('b', 1, -2)]);
    expect(r).toEqual({ x: 2, z: 3, guideX: null, guideZ: null });
  });
});
