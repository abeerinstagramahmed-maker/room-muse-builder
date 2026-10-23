import loungeSofa from '@/assets/models/loungeSofa.glb.asset.json';
import loungeChair from '@/assets/models/loungeChair.glb.asset.json';
import chairCushion from '@/assets/models/chairCushion.glb.asset.json';
import tableCoffee from '@/assets/models/tableCoffee.glb.asset.json';
import lampRoundFloor from '@/assets/models/lampRoundFloor.glb.asset.json';
import bedDouble from '@/assets/models/bedDouble.glb.asset.json';
import bookcaseOpen from '@/assets/models/bookcaseOpen.glb.asset.json';
import plantSmall from '@/assets/models/plantSmall1.glb.asset.json';
import { PlacedFurniture } from '@/types/studio';

/** CC0 models (Kenney Furniture Kit) used when a product has no model of its own. */
const RULES: [RegExp, string][] = [
  [/sofa|couch|sectional/, loungeSofa.url],
  [/dining|desk chair|side chair/, chairCushion.url],
  [/armchair|lounge|accent chair|chair/, loungeChair.url],
  [/coffee/, tableCoffee.url],
  [/lamp|lighting/, lampRoundFloor.url],
  [/bed/, bedDouble.url],
  [/bookcase|storage|shelving/, bookcaseOpen.url],
  [/plant/, plantSmall.url],
];

export function curatedModelUrl(category?: string, name?: string): string | null {
  const text = `${name ?? ''} ${category ?? ''}`.toLowerCase();
  for (const [re, url] of RULES) if (re.test(text)) return url;
  return null;
}

export function resolveModelUrl(item: PlacedFurniture): string | null {
  if (item.modelUrl) return item.modelUrl;
  if (item.mountType === 'wall') return null;
  return curatedModelUrl(item.category, item.name);
}
