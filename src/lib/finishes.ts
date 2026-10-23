export type FinishGroup = 'fabric' | 'wood' | 'metal';

export interface Finish {
  id: string;
  label: string;
  group: FinishGroup;
  color: string;
  roughness: number;
  metalness: number;
}

export const FINISHES: Finish[] = [
  { id: 'ivory-boucle', label: 'Ivory Bouclé', group: 'fabric', color: '#ece4d6', roughness: 1, metalness: 0 },
  { id: 'charcoal', label: 'Charcoal', group: 'fabric', color: '#3b3b3f', roughness: 0.95, metalness: 0 },
  { id: 'olive', label: 'Olive', group: 'fabric', color: '#6b6f45', roughness: 0.95, metalness: 0 },
  { id: 'cognac-leather', label: 'Cognac Leather', group: 'fabric', color: '#8b4a26', roughness: 0.55, metalness: 0 },
  { id: 'natural-oak', label: 'Natural Oak', group: 'wood', color: '#c49a6c', roughness: 0.6, metalness: 0 },
  { id: 'walnut', label: 'Walnut', group: 'wood', color: '#5a3a28', roughness: 0.55, metalness: 0 },
  { id: 'matte-black', label: 'Matte Black', group: 'wood', color: '#232325', roughness: 0.7, metalness: 0 },
  { id: 'brushed-brass', label: 'Brushed Brass', group: 'metal', color: '#b8945a', roughness: 0.3, metalness: 0.9 },
  { id: 'matte-steel', label: 'Matte Steel', group: 'metal', color: '#8d9196', roughness: 0.4, metalness: 0.85 },
];

export function getFinish(id?: string | null): Finish | undefined {
  return id ? FINISHES.find((f) => f.id === id) : undefined;
}

export function finishGroupsForCategory(category?: string): FinishGroup[] {
  const c = (category ?? '').toLowerCase();
  if (/sofa|bed|chair/.test(c)) return ['fabric', 'wood'];
  if (/table|storage|shelf/.test(c)) return ['wood', 'metal'];
  if (/lamp|light|mirror|art/.test(c)) return ['metal'];
  return ['fabric', 'wood', 'metal'];
}
