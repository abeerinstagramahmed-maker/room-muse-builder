import { describe, expect, it } from 'vitest';
import { cameraPose, isWallCutAway } from './studioCamera';

const room = { width: 10, depth: 10, height: 8 };

describe('Studio camera views', () => {
  it('places the top camera directly above the floor', () => {
    const pose = cameraPose('top', room);
    expect(pose.position[0]).toBe(0);
    expect(pose.position[1]).toBeGreaterThan(8);
    expect(pose.target).toEqual([0, 0, 0]);
  });
  it('places each side camera outside its named wall', () => {
    expect(cameraPose('north', room).position[2]).toBeLessThan(-5);
    expect(cameraPose('south', room).position[2]).toBeGreaterThan(5);
    expect(cameraPose('east', room).position[0]).toBeGreaterThan(5);
    expect(cameraPose('west', room).position[0]).toBeLessThan(-5);
  });
  it('cuts away only walls between the camera and interior', () => {
    expect(isWallCutAway('south', { x: 20, z: 20 }, room)).toBe(true);
    expect(isWallCutAway('east', { x: 20, z: 20 }, room)).toBe(true);
    expect(isWallCutAway('north', { x: 20, z: 20 }, room)).toBe(false);
    expect(isWallCutAway('west', { x: 20, z: 20 }, room)).toBe(false);
  });
  it('keeps all walls for an overhead camera inside the footprint', () => {
    for (const wall of ['north', 'south', 'east', 'west'] as const) {
      expect(isWallCutAway(wall, { x: 0, z: 0 }, room)).toBe(false);
    }
  });
  it('puts the eye-level camera inside the room at standing height', () => {
    const pose = cameraPose('eye', room);
    expect(pose.position[1]).toBe(5.5);
    expect(Math.abs(pose.position[2])).toBeLessThan(5);
  });
});
