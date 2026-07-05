import { PlacedFurniture, RoomDimensions } from '@/types/studio';

/** Pixels per foot used when rasterizing the 2D floor plan. */
const PPF = 40;
const PADDING = 60;

/** Formats a foot value as feet/inches, e.g. 12.5 -> 12' 6". */
function formatFeet(value: number): string {
  const ft = Math.floor(value);
  const inches = Math.round((value - ft) * 12);
  return inches === 0 ? `${ft}'` : `${ft}' ${inches}"`;
}

/**
 * Builds an SVG string for a top-down floor plan of the room and its furniture.
 * World coordinates are centered at the room origin (0,0) on the X/Z plane.
 */
export function buildFloorPlanSVG(
  room: RoomDimensions,
  furniture: PlacedFurniture[],
): string {
  const w = room.width * PPF;
  const d = room.depth * PPF;
  const svgW = w + PADDING * 2;
  const svgH = d + PADDING * 2;

  // Convert world (x,z) with origin at center to SVG top-left coordinates.
  const toX = (x: number) => PADDING + (x + room.width / 2) * PPF;
  const toY = (z: number) => PADDING + (z + room.depth / 2) * PPF;

  const items = furniture
    .filter((f) => f.mountType !== 'wall')
    .map((f) => {
      const iw = f.size[0] * f.scale * PPF;
      const id = f.size[2] * f.scale * PPF;
      const cx = toX(f.position[0]);
      const cy = toY(f.position[2]);
      const deg = (f.rotationY * 180) / Math.PI;
      return `
      <g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${(-deg).toFixed(1)})">
        <rect x="${(-iw / 2).toFixed(1)}" y="${(-id / 2).toFixed(1)}" width="${iw.toFixed(1)}" height="${id.toFixed(1)}"
          fill="#c9a36b" fill-opacity="0.55" stroke="#7a5a34" stroke-width="1.5" rx="3" />
        <text x="0" y="4" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#3a2a18">${escapeXml(
          f.name,
        )}</text>
      </g>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="${svgW}" height="${svgH}" fill="#f7f5f1" />
  <rect x="${PADDING}" y="${PADDING}" width="${w}" height="${d}" fill="#ffffff" stroke="#3a3a3e" stroke-width="3" />
  <text x="${svgW / 2}" y="${PADDING - 24}" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#3a3a3e">Floor Plan — ${formatFeet(
    room.width,
  )} × ${formatFeet(room.depth)}</text>
  <text x="${svgW / 2}" y="${PADDING + d + 30}" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#666">Width: ${formatFeet(
    room.width,
  )}</text>
  <text x="${PADDING - 20}" y="${PADDING + d / 2}" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#666" transform="rotate(-90 ${
    PADDING - 20
  } ${PADDING + d / 2})">Depth: ${formatFeet(room.depth)}</text>
  ${items}
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Triggers a browser download of the given text as a file. */
export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Builds a CSV shopping list from placed furniture. */
export function buildShoppingListCSV(furniture: PlacedFurniture[]): string {
  const rows = ['Item,Quantity'];
  const counts = new Map<string, number>();
  for (const f of furniture) {
    counts.set(f.name, (counts.get(f.name) ?? 0) + 1);
  }
  for (const [name, qty] of counts) {
    rows.push(`"${name.replace(/"/g, '""')}",${qty}`);
  }
  return rows.join('\n');
}
