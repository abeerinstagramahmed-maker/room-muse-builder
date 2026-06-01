/** Studio domain types for the 3D room planner. */

export type WallId = 'north' | 'south' | 'east' | 'west';

export interface RoomDimensions {
  /** All units in feet. */
  width: number;
  depth: number;
  height: number;
}

export type WallColors = Record<WallId, string>;

export interface FlooringOption {
  id: string;
  label: string;
  /** Base color used for the floor material. */
  color: string;
  /** Roughness for the PBR material. */
  roughness: number;
}

export interface PaintPreset {
  id: string;
  label: string;
  color: string;
}

export interface ProductCategoryDef {
  id: string;
  label: string;
}

/** A furniture instance placed in the scene. */
export interface PlacedFurniture {
  /** Unique per-instance id (not the product id). */
  instanceId: string;
  productId: string;
  name: string;
  modelUrl: string | null;
  /** Footprint/size in feet [width, height, depth]. */
  size: [number, number, number];
  position: [number, number, number];
  /** Y-axis rotation in radians. */
  rotationY: number;
  scale: number;
}

/** Serializable scene representation stored in saved_scenes.scene_data. */
export interface SceneData {
  version: 1;
  room: RoomDimensions;
  wallColors: WallColors;
  flooringId: string;
  furniture: PlacedFurniture[];
}
