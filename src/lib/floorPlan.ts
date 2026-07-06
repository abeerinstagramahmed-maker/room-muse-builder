import { PlacedFurniture, RoomDimensions } from '@/types/studio';

/** Pixels per foot used when rasterizing the 2D floor plan. */
const PPF = 40;
const PADDING = 60;
const LEGEND_ROW_H = 22;
const LEGEND_HEADER_H = 34;

/** Formats a foot value as feet/inches, e.g. 12.5 -> 12' 6". */
function formatFeet(value: number): string {
  const ft = Math.floor(value);
  const inches = Math.round((value - ft) * 12);
  return inches === 0 ? `${ft}'` : `${ft}' ${inches}"`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Builds an SVG string for a top-down floor plan of the room and its furniture,
 * including a numbered legend mapping each symbol to a product name + category.
 * World coordinates are centered at the room origin (0,0) on the X/Z plane.
 */
export function buildFloorPlanSVG(
  room: RoomDimensions,
  furniture: PlacedFurniture[],
): string {
  const floorItems = furniture.filter((f) => f.mountType !== 'wall');
  const w = room.width * PPF;
  const d = room.depth * PPF;
  const svgW = w + PADDING * 2;

  const legendHeight =
    floorItems.length > 0
      ? LEGEND_HEADER_H + floorItems.length * LEGEND_ROW_H + 16
      : 0;
  const svgH = d + PADDING * 2 + legendHeight;

  // Convert world (x,z) with origin at center to SVG top-left coordinates.
  const toX = (x: number) => PADDING + (x + room.width / 2) * PPF;
  const toY = (z: number) => PADDING + (z + room.depth / 2) * PPF;

  const items = floorItems
    .map((f, i) => {
      const iw = f.size[0] * f.scale * PPF;
      const id = f.size[2] * f.scale * PPF;
      const cx = toX(f.position[0]);
      const cy = toY(f.position[2]);
      const deg = (f.rotationY * 180) / Math.PI;
      return `
      <g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${(-deg).toFixed(1)})">
        <rect x="${(-iw / 2).toFixed(1)}" y="${(-id / 2).toFixed(1)}" width="${iw.toFixed(1)}" height="${id.toFixed(1)}"
          fill="#c9a36b" fill-opacity="0.55" stroke="#7a5a34" stroke-width="1.5" rx="3" />
        <circle cx="0" cy="0" r="10" fill="#3a2a18" />
        <text x="0" y="4" text-anchor="middle" font-size="12" font-weight="bold" font-family="sans-serif" fill="#fff">${i + 1}</text>
      </g>`;
    })
    .join('');

  const legendTop = PADDING + d + 40;
  const legend =
    floorItems.length > 0
      ? `
  <text x="${PADDING}" y="${legendTop}" font-size="14" font-weight="bold" font-family="sans-serif" fill="#3a3a3e">Legend</text>
  ${floorItems
    .map((f, i) => {
      const y = legendTop + LEGEND_HEADER_H + i * LEGEND_ROW_H - 6;
      const cat = f.category ? ` — ${escapeXml(f.category)}` : '';
      const dims = `${f.size[0]}′W × ${f.size[2]}′D × ${f.size[1]}′H`;
      return `
    <circle cx="${PADDING + 8}" cy="${y - 4}" r="9" fill="#3a2a18" />
    <text x="${PADDING + 8}" y="${y - 0.5}" text-anchor="middle" font-size="11" font-weight="bold" font-family="sans-serif" fill="#fff">${i + 1}</text>
    <text x="${PADDING + 26}" y="${y}" font-size="12" font-family="sans-serif" fill="#2a2a2e">${escapeXml(f.name)}${cat} (${dims})</text>`;
    })
    .join('')}`
      : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="${svgW}" height="${svgH}" fill="#f7f5f1" />
  <rect x="${PADDING}" y="${PADDING}" width="${w}" height="${d}" fill="#ffffff" stroke="#3a3a3e" stroke-width="3" />
  <text x="${svgW / 2}" y="${PADDING - 24}" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#3a3a3e">Floor Plan — ${formatFeet(
    room.width,
  )} × ${formatFeet(room.depth)}</text>
  <text x="${svgW / 2}" y="${PADDING + d + 24}" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#666">Width: ${formatFeet(
    room.width,
  )}</text>
  <text x="${PADDING - 20}" y="${PADDING + d / 2}" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#666" transform="rotate(-90 ${
    PADDING - 20
  } ${PADDING + d / 2})">Depth: ${formatFeet(room.depth)}</text>
  ${items}
  ${legend}
</svg>`;
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

/**
 * Opens a print-ready page containing the floor plan SVG so the user can
 * save it as a PDF via the browser print dialog.
 */
export function printFloorPlanPDF(room: RoomDimensions, furniture: PlacedFurniture[]) {
  const svg = buildFloorPlanSVG(room, furniture);
  const win = window.open('', '_blank', 'noopener,width=900,height=1000');
  if (!win) return false;
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Floor Plan</title>
  <meta charset="utf-8" />
  <style>
    @page { margin: 12mm; }
    html, body { margin: 0; padding: 0; }
    .wrap { display: flex; justify-content: center; padding: 16px; }
    svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="wrap">${svg}</div>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`);
  win.document.close();
  return true;
}

/** Builds a CSV shopping list from placed furniture with quantity, category and dimensions. */
export function buildShoppingListCSV(furniture: PlacedFurniture[]): string {
  const rows = ['Item,Category,Quantity,Width (ft),Depth (ft),Height (ft)'];
  interface Agg {
    name: string;
    category: string;
    qty: number;
    size: [number, number, number];
  }
  const map = new Map<string, Agg>();
  for (const f of furniture) {
    const key = `${f.name}|${f.category ?? ''}`;
    const existing = map.get(key);
    if (existing) existing.qty += 1;
    else
      map.set(key, {
        name: f.name,
        category: f.category ?? '',
        qty: 1,
        size: f.size,
      });
  }
  for (const a of map.values()) {
    const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
    rows.push(
      [
        q(a.name),
        q(a.category),
        a.qty,
        a.size[0],
        a.size[2],
        a.size[1],
      ].join(','),
    );
  }
  return rows.join('\n');
}
