import { RoomDimensions, WallColors } from '@/types/studio';

/**
 * Predefined starting points for common room types. Templates only set room
 * shell properties (dimensions, wall colour, flooring). Furniture is added by
 * the user from the catalog or via AI suggestions.
 */
export interface RoomTemplate {
  id: string;
  label: string;
  description: string;
  room: RoomDimensions;
  wallColor: string;
  flooringId: string;
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'living-room',
    label: 'Living Room',
    description: 'Spacious lounge for sofas, a coffee table and a rug.',
    room: { width: 16, depth: 20, height: 9 },
    wallColor: '#e8e4dd',
    flooringId: 'oak',
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    description: 'Cozy retreat sized for a bed and nightstands.',
    room: { width: 13, depth: 14, height: 9 },
    wallColor: '#a8b5a2',
    flooringId: 'walnut',
  },
  {
    id: 'home-office',
    label: 'Home Office',
    description: 'Compact workspace for a desk and storage.',
    room: { width: 11, depth: 12, height: 9 },
    wallColor: '#c9ccd1',
    flooringId: 'hardwood',
  },
  {
    id: 'dining-room',
    label: 'Dining Room',
    description: 'Open layout for a dining table and chairs.',
    room: { width: 14, depth: 16, height: 10 },
    wallColor: '#c4654a',
    flooringId: 'walnut',
  },
  {
    id: 'studio-apartment',
    label: 'Studio Apartment',
    description: 'Large multi-purpose open-plan space.',
    room: { width: 20, depth: 24, height: 10 },
    wallColor: '#e8e4dd',
    flooringId: 'hardwood',
  },
  {
    id: 'kids-room',
    label: 'Kids Room',
    description: 'Bright, smaller room for a child’s bedroom.',
    room: { width: 11, depth: 12, height: 9 },
    wallColor: '#e3c4c4',
    flooringId: 'carpet',
  },
];

export function makeWallColors(color: string): WallColors {
  return { north: color, south: color, east: color, west: color };
}
