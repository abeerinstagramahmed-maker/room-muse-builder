import { FlooringOption, PaintPreset, ProductCategoryDef, RoomDimensions, WallColors } from '@/types/studio';

/** 1 foot = this many world units (we use 1:1 feet → three.js units). */
export const FT = 1;

export const DEFAULT_ROOM: RoomDimensions = { width: 15, depth: 20, height: 9 };

export const ROOM_LIMITS = {
  width: { min: 6, max: 40, step: 0.5 },
  depth: { min: 6, max: 40, step: 0.5 },
  height: { min: 7, max: 16, step: 0.5 },
};

export const DEFAULT_WALL_COLOR = '#e8e4dd';

export const DEFAULT_WALL_COLORS: WallColors = {
  north: DEFAULT_WALL_COLOR,
  south: DEFAULT_WALL_COLOR,
  east: DEFAULT_WALL_COLOR,
  west: DEFAULT_WALL_COLOR,
};

export const PAINT_PRESETS: PaintPreset[] = [
  { id: 'warm-white', label: 'Warm White', color: '#e8e4dd' },
  { id: 'cloud-grey', label: 'Cloud Grey', color: '#c9ccd1' },
  { id: 'sage', label: 'Sage', color: '#a8b5a2' },
  { id: 'terracotta', label: 'Terracotta', color: '#c4654a' },
  { id: 'navy', label: 'Navy', color: '#2d3a55' },
  { id: 'charcoal', label: 'Charcoal', color: '#3a3a3e' },
  { id: 'blush', label: 'Blush', color: '#e3c4c4' },
  { id: 'ochre', label: 'Ochre', color: '#c9a14a' },
];

export const FLOORING_OPTIONS: FlooringOption[] = [
  { id: 'hardwood', label: 'Hardwood', color: '#9c6b3f', roughness: 0.6 },
  { id: 'oak', label: 'Oak', color: '#c9a36b', roughness: 0.65 },
  { id: 'walnut', label: 'Walnut', color: '#5a3a28', roughness: 0.55 },
  { id: 'white-tile', label: 'White Tile', color: '#ececec', roughness: 0.25 },
  { id: 'gray-tile', label: 'Gray Tile', color: '#9a9a9e', roughness: 0.3 },
  { id: 'carpet', label: 'Carpet', color: '#b6ada0', roughness: 0.95 },
];

export const DEFAULT_FLOORING_ID = 'oak';

export function getFlooring(id: string): FlooringOption {
  return FLOORING_OPTIONS.find((f) => f.id === id) ?? FLOORING_OPTIONS[1];
}

export const PRODUCT_CATEGORIES: ProductCategoryDef[] = [
  { id: 'Sofa', label: 'Sofa' },
  { id: 'Bed', label: 'Bed' },
  { id: 'Chair', label: 'Chair' },
  { id: 'Table', label: 'Table' },
  { id: 'Coffee Table', label: 'Coffee Table' },
  { id: 'Rug', label: 'Rug' },
  { id: 'Lamp', label: 'Lamp' },
  { id: 'Storage', label: 'Storage' },
  { id: 'Decor', label: 'Decor' },
  { id: 'Wall Art', label: 'Wall Art' },
  { id: 'Mirror', label: 'Mirror' },
  { id: 'Wall Shelf', label: 'Wall Shelf' },
  { id: 'Lighting', label: 'Lighting' },
  { id: 'Plant', label: 'Plant' },
];

/** Categories whose items mount on a wall rather than the floor. */
export const WALL_CATEGORIES = new Set([
  'Wall Art',
  'Mirror',
  'Wall Shelf',
  'Art',
  'Painting',
  'Frame',
]);

export function mountTypeForCategory(category: string | null | undefined): 'floor' | 'wall' {
  return category && WALL_CATEGORIES.has(category) ? 'wall' : 'floor';
}
