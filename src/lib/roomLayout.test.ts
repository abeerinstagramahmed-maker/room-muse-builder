import { describe, expect, it } from 'vitest';
import { clampToFloor, floorArea, notchRect } from './roomLayout';

const l = { width: 16, depth: 20, height: 9, notch: { width: 6, depth: 8 } };

describe('L-shaped rooms', () => {
  it('subtracts the cut-out corner from the floor area', () => {
    expect(floorArea(l)).toBe(320 - 48);
    expect(floorArea({ width: 10, depth: 10, height: 8 })).toBe(100);
  });
  it('places the cut-out in the back-right corner', () => {
    expect(notchRect(l)).toEqual({ x0: 2, x1: 8, z0: -10, z1: -2 });
  });
  it('pushes dropped items out of the cut-out corner', () => {
    const [x, z] = clampToFloor(6, -8, l);
    expect(x <= 2 || z >= -2).toBe(true);
  });
  it('keeps items inside the outer walls', () => {
    expect(clampToFloor(50, 50, l, [1, 1])).toEqual([7, 9]);
  });
});
