import { Move, RotateCw, Copy, Trash2, Grid3x3, Box, Paintbrush, Sun } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useStudioStore } from '@/stores/studioStore';
import {
  FLOORING_OPTIONS,
  LIGHTING_PRESETS,
  PAINT_PRESETS,
  ROOM_LIMITS,
} from '@/lib/studioConstants';
import { cn } from '@/lib/utils';
import { WallId } from '@/types/studio';

const WALL_LABELS: Record<WallId, string> = {
  north: 'North Wall',
  south: 'South Wall',
  east: 'East Wall',
  west: 'West Wall',
};

function SelectedItemPanel() {
  const furniture = useStudioStore((s) => s.furniture);
  const selectedId = useStudioStore((s) => s.selectedId);
  const transformMode = useStudioStore((s) => s.transformMode);
  const setTransformMode = useStudioStore((s) => s.setTransformMode);
  const updateFurniture = useStudioStore((s) => s.updateFurniture);
  const duplicateFurniture = useStudioStore((s) => s.duplicateFurniture);
  const deleteFurniture = useStudioStore((s) => s.deleteFurniture);

  const item = furniture.find((f) => f.instanceId === selectedId);
  if (!item) return null;

  const setPos = (axis: 0 | 1 | 2, value: number) => {
    const next = [...item.position] as [number, number, number];
    next[axis] = value;
    updateFurniture(item.instanceId, { position: next });
  };

  const rotationDeg = Math.round((item.rotationY * 180) / Math.PI);

  return (
    <div className="space-y-4 border-b p-4">
      <div className="flex items-center gap-2">
        <Box className="h-4 w-4" />
        <h3 className="text-sm font-semibold">{item.name}</h3>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={transformMode === 'translate' ? 'default' : 'outline'}
          className="flex-1 gap-1.5"
          onClick={() => setTransformMode('translate')}
        >
          <Move className="h-3.5 w-3.5" /> Move
        </Button>
        <Button
          size="sm"
          variant={transformMode === 'rotate' ? 'default' : 'outline'}
          className="flex-1 gap-1.5"
          onClick={() => setTransformMode('rotate')}
        >
          <RotateCw className="h-3.5 w-3.5" /> Rotate
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Position X (ft)</Label>
          <Input
            type="number"
            step="0.25"
            value={item.position[0].toFixed(2)}
            onChange={(e) => setPos(0, Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="text-xs">Position Z (ft)</Label>
          <Input
            type="number"
            step="0.25"
            value={item.position[2].toFixed(2)}
            onChange={(e) => setPos(2, Number(e.target.value))}
          />
        </div>
      </div>

      {item.mountType === 'wall' && (
        <div>
          <Label className="text-xs">Mount Height (ft)</Label>
          <Input
            type="number"
            step="0.25"
            min={0}
            value={item.position[1].toFixed(2)}
            onChange={(e) => setPos(1, Number(e.target.value))}
          />
        </div>
      )}

      <div>
        <Label className="text-xs">Rotation: {rotationDeg}°</Label>
        <Slider
          min={0}
          max={360}
          step={5}
          value={[((rotationDeg % 360) + 360) % 360]}
          onValueChange={([deg]) =>
            updateFurniture(item.instanceId, { rotationY: (deg * Math.PI) / 180 })
          }
        />
      </div>


      <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
        Dimensions: {item.size[0]}′ W × {item.size[2]}′ D × {item.size[1]}′ H
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={() => duplicateFurniture(item.instanceId)}
        >
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="flex-1 gap-1.5"
          onClick={() => deleteFurniture(item.instanceId)}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}

function WallPanel() {
  const selectedWall = useStudioStore((s) => s.selectedWall);
  const wallColors = useStudioStore((s) => s.wallColors);
  const setWallColor = useStudioStore((s) => s.setWallColor);
  if (!selectedWall) return null;

  return (
    <div className="space-y-3 border-b p-4">
      <div className="flex items-center gap-2">
        <Paintbrush className="h-4 w-4" />
        <h3 className="text-sm font-semibold">{WALL_LABELS[selectedWall]}</h3>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={wallColors[selectedWall]}
          onChange={(e) => setWallColor(selectedWall, e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border"
        />
        <Input
          value={wallColors[selectedWall]}
          onChange={(e) => setWallColor(selectedWall, e.target.value)}
        />
      </div>
      <div>
        <Label className="text-xs">Paint Presets</Label>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {PAINT_PRESETS.map((p) => (
            <button
              key={p.id}
              title={p.label}
              onClick={() => setWallColor(selectedWall, p.color)}
              className={cn(
                'h-8 rounded border-2',
                wallColors[selectedWall].toLowerCase() === p.color.toLowerCase()
                  ? 'border-primary'
                  : 'border-transparent',
              )}
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomPanel() {
  const room = useStudioStore((s) => s.room);
  const setRoom = useStudioStore((s) => s.setRoom);
  const flooringId = useStudioStore((s) => s.flooringId);
  const setFlooring = useStudioStore((s) => s.setFlooring);
  const gridVisible = useStudioStore((s) => s.gridVisible);
  const toggleGrid = useStudioStore((s) => s.toggleGrid);
  const lightingId = useStudioStore((s) => s.lightingId);
  const setLighting = useStudioStore((s) => s.setLighting);
  const brightness = useStudioStore((s) => s.brightness);
  const setBrightness = useStudioStore((s) => s.setBrightness);

  const dim = (key: 'width' | 'depth' | 'height', label: string) => {
    const lim = ROOM_LIMITS[key];
    return (
      <div>
        <Label className="text-xs">
          {label}: {room[key]} ft
        </Label>
        <Slider
          min={lim.min}
          max={lim.max}
          step={lim.step}
          value={[room[key]]}
          onValueChange={([v]) => setRoom({ [key]: v })}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold">Room Properties</h3>
      <div className="space-y-3">
        {dim('width', 'Width')}
        {dim('depth', 'Depth')}
        {dim('height', 'Height')}
      </div>

      <div>
        <Label className="text-xs">Flooring</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {FLOORING_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFlooring(f.id)}
              className={cn(
                'flex items-center gap-2 rounded-md border p-1.5 text-xs transition-colors',
                flooringId === f.id ? 'border-primary bg-primary/5' : 'hover:bg-muted',
              )}
            >
              <span
                className="h-5 w-5 rounded border"
                style={{ backgroundColor: f.color }}
              />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border p-2.5">
        <Label className="flex items-center gap-2 text-xs">
          <Grid3x3 className="h-4 w-4" /> Floor Grid
        </Label>
        <Switch checked={gridVisible} onCheckedChange={toggleGrid} />
      </div>

      <SnapControl />


      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <Sun className="h-4 w-4" /> Lighting
        </Label>
        <div className="grid grid-cols-2 gap-1.5">
          {LIGHTING_PRESETS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLighting(l.id)}
              className={cn(
                'rounded-md border p-1.5 text-xs transition-colors',
                lightingId === l.id ? 'border-primary bg-primary/5' : 'hover:bg-muted',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <Label className="text-xs">
          Brightness: {Math.round(brightness * 100)}%
        </Label>
        <Slider
          min={0.3}
          max={1.8}
          step={0.05}
          value={[brightness]}
          onValueChange={([v]) => setBrightness(v)}
        />
      </div>

      <div className="space-y-1 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Shortcuts</p>
        <p>Move (M) · Rotate (R) · Grid (G)</p>
        <p>Delete · Duplicate (Ctrl+D)</p>
        <p>Undo (Ctrl+Z) · Redo (Ctrl+Shift+Z)</p>
        <p className="pt-1">
          Wall Art &amp; Mirrors mount on walls — adjust their mount height in the
          item panel.
        </p>
      </div>

    </div>
  );
}

export function PropertiesSidebar() {
  return (
    <aside className="flex h-full w-72 flex-col border-l bg-card">
      <ScrollArea className="flex-1">
        <SelectedItemPanel />
        <WallPanel />
        <RoomPanel />
      </ScrollArea>
    </aside>
  );
}
