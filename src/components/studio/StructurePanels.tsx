import { DoorOpen, AppWindow, Trash2, Square, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useStudioStore } from '@/stores/studioStore';
import { OPENING_PRESETS, RUG_COLORS } from '@/lib/studioConstants';
import { cn } from '@/lib/utils';
import { OpeningType, Rug } from '@/types/studio';

const OPENING_ICONS: Record<OpeningType, typeof DoorOpen> = {
  window: AppWindow,
  'wide-window': AppWindow,
  door: DoorOpen,
  'double-door': DoorOpen,
};

function wallLength(wall: string, room: { width: number; depth: number }) {
  return wall === 'north' || wall === 'south' ? room.width : room.depth;
}

/** Add and edit windows/doors on the currently selected wall. */
export function WallOpeningsPanel() {
  const selectedWall = useStudioStore((s) => s.selectedWall);
  const room = useStudioStore((s) => s.room);
  const openings = useStudioStore((s) => s.openings);
  const selectedOpeningId = useStudioStore((s) => s.selectedOpeningId);
  const addOpening = useStudioStore((s) => s.addOpening);
  const updateOpening = useStudioStore((s) => s.updateOpening);
  const removeOpening = useStudioStore((s) => s.removeOpening);
  const selectOpening = useStudioStore((s) => s.selectOpening);
  const beginHistory = useStudioStore((s) => s.beginHistory);
  if (!selectedWall) return null;

  const len = wallLength(selectedWall, room);
  const onWall = openings.filter((o) => o.wall === selectedWall);
  const active = onWall.find((o) => o.id === selectedOpeningId) ?? null;

  const add = (type: OpeningType) => {
    const p = OPENING_PRESETS[type];
    const width = Math.min(p.width, len - 1);
    addOpening({ type, wall: selectedWall, offset: 0, width, height: Math.min(p.height, room.height - p.sill - 0.5), sill: p.sill });
  };

  return (
    <div className="space-y-3 border-b p-4">
      <Label className="text-xs">Windows &amp; Doors</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {(Object.keys(OPENING_PRESETS) as OpeningType[]).map((t) => {
          const Icon = OPENING_ICONS[t];
          return (
            <Button key={t} size="sm" variant="outline" className="justify-start gap-1.5 text-xs" onClick={() => add(t)}>
              <Icon className="h-3.5 w-3.5" /> {OPENING_PRESETS[t].label}
            </Button>
          );
        })}
      </div>

      {onWall.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {onWall.map((o, i) => (
            <button
              key={o.id}
              onClick={() => selectOpening(o.id)}
              className={cn(
                'rounded-md border px-2 py-1 text-xs',
                o.id === active?.id ? 'border-primary bg-primary/5' : 'hover:bg-muted',
              )}
            >
              {OPENING_PRESETS[o.type].label} {i + 1}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="space-y-3 rounded-md border p-2.5">
          <div>
            <Label className="text-xs">Position: {active.offset.toFixed(1)} ft</Label>
            <Slider
              min={-len / 2 + active.width / 2 + 0.25}
              max={len / 2 - active.width / 2 - 0.25}
              step={0.25}
              value={[active.offset]}
              onPointerDown={beginHistory}
              onValueChange={([v]) => updateOpening(active.id, { offset: v })}
            />
          </div>
          <div>
            <Label className="text-xs">Width: {active.width} ft</Label>
            <Slider
              min={1.5}
              max={Math.max(2, len - 1)}
              step={0.25}
              value={[active.width]}
              onPointerDown={beginHistory}
              onValueChange={([v]) => updateOpening(active.id, { width: v })}
            />
          </div>
          <div>
            <Label className="text-xs">Height: {active.height} ft</Label>
            <Slider
              min={1.5}
              max={room.height - active.sill - 0.3}
              step={0.25}
              value={[active.height]}
              onPointerDown={beginHistory}
              onValueChange={([v]) => updateOpening(active.id, { height: v })}
            />
          </div>
          {(active.type === 'window' || active.type === 'wide-window') && (
            <div>
              <Label className="text-xs">Sill height: {active.sill} ft</Label>
              <Slider
                min={0.5}
                max={room.height - active.height - 0.3}
                step={0.25}
                value={[active.sill]}
                onPointerDown={beginHistory}
                onValueChange={([v]) => updateOpening(active.id, { sill: v })}
              />
            </div>
          )}
          <Button size="sm" variant="destructive" className="w-full gap-1.5" onClick={() => removeOpening(active.id)}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
        </div>
      )}
    </div>
  );
}

/** Add rugs and edit the selected rug. */
export function RugsPanel() {
  const rugs = useStudioStore((s) => s.rugs);
  const room = useStudioStore((s) => s.room);
  const selectedRugId = useStudioStore((s) => s.selectedRugId);
  const addRug = useStudioStore((s) => s.addRug);
  const updateRug = useStudioStore((s) => s.updateRug);
  const removeRug = useStudioStore((s) => s.removeRug);
  const selectRug = useStudioStore((s) => s.selectRug);
  const beginHistory = useStudioStore((s) => s.beginHistory);
  const active = rugs.find((r) => r.id === selectedRugId) ?? null;

  const add = (shape: Rug['shape']) =>
    addRug({
      shape,
      color: RUG_COLORS[rugs.length % RUG_COLORS.length],
      pattern: 'border',
      width: shape === 'round' ? 6 : 8,
      depth: shape === 'round' ? 6 : 5,
      x: 0,
      z: 0,
    });

  const slider = (label: string, key: 'width' | 'depth' | 'x' | 'z', min: number, max: number) =>
    active && (
      <div>
        <Label className="text-xs">{label}: {active[key].toFixed(1)} ft</Label>
        <Slider
          min={min}
          max={max}
          step={0.25}
          value={[active[key]]}
          onPointerDown={beginHistory}
          onValueChange={([v]) => updateRug(active.id, { [key]: v })}
        />
      </div>
    );

  return (
    <div className="space-y-3 border-b p-4">
      <Label className="text-xs">Rugs</Label>
      <div className="grid grid-cols-2 gap-1.5">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => add('rect')}>
          <Square className="h-3.5 w-3.5" /> Rectangle
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => add('round')}>
          <Circle className="h-3.5 w-3.5" /> Round
        </Button>
      </div>
      {rugs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {rugs.map((r, i) => (
            <button
              key={r.id}
              onClick={() => selectRug(r.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs',
                r.id === active?.id ? 'border-primary bg-primary/5' : 'hover:bg-muted',
              )}
            >
              <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: r.color }} /> Rug {i + 1}
            </button>
          ))}
        </div>
      )}
      {active && (
        <div className="space-y-3 rounded-md border p-2.5">
          <div className="grid grid-cols-8 gap-1">
            {RUG_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateRug(active.id, { color: c })}
                className={cn('h-6 rounded border-2', active.color === c ? 'border-primary' : 'border-transparent')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['solid', 'stripe', 'border'] as const).map((p) => (
              <button
                key={p}
                onClick={() => updateRug(active.id, { pattern: p })}
                className={cn(
                  'rounded-md border py-1 text-xs capitalize',
                  active.pattern === p ? 'border-primary bg-primary/5' : 'hover:bg-muted',
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {slider('Width', 'width', 2, room.width)}
          {slider('Length', 'depth', 2, room.depth)}
          {slider('Position X', 'x', -room.width / 2, room.width / 2)}
          {slider('Position Z', 'z', -room.depth / 2, room.depth / 2)}
          <Button size="sm" variant="destructive" className="w-full gap-1.5" onClick={() => removeRug(active.id)}>
            <Trash2 className="h-3.5 w-3.5" /> Remove rug
          </Button>
        </div>
      )}
    </div>
  );
}
