import { PersonStanding, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Box, Grid2X2, PanelLeft, Paintbrush, Ruler, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useStudioStore } from '@/stores/studioStore';
import { CameraView } from '@/lib/studioCamera';
import { walkInput } from '@/lib/walkInput';

export function CameraDock({ onEditRoom, onMaterials }: { onEditRoom: () => void; onMaterials: () => void }) {
  const view = useStudioStore((s) => s.cameraView);
  const setView = useStudioStore((s) => s.setCameraView);
  const measure = useStudioStore((s) => s.measureMode);
  const toggleMeasure = useStudioStore((s) => s.toggleMeasureMode);
  const action = (label: string, icon: React.ReactNode, click: () => void, active = false) => (
    <Tooltip key={label}>
      <TooltipTrigger asChild>
        <Button variant={active ? 'default' : 'ghost'} size="icon" aria-label={label} aria-pressed={active} className="h-11 w-11 shrink-0 rounded-full sm:w-auto sm:px-3" onClick={click}>
          {icon}<span className="hidden text-xs sm:inline">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
  return (
    <TooltipProvider delayDuration={200}>
      <div role="toolbar" aria-label="Camera and room actions" className="absolute bottom-5 left-1/2 z-20 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 rounded-full bg-background/90 p-1.5 text-foreground shadow-elevated backdrop-blur-xl">
        {action('Dollhouse', <Box />, () => setView('dollhouse'), view === 'dollhouse')}
        {action('Top view', <Grid2X2 />, () => setView('top'), view === 'top')}
        {action('Eye level', <PersonStanding />, () => setView('eye'), view === 'eye')}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={view !== 'dollhouse' && view !== 'top' && view !== 'eye' ? 'default' : 'ghost'} aria-label="Side views" className="h-11 w-11 shrink-0 rounded-full p-0 sm:w-auto sm:px-3">
              <PanelLeft /><span className="hidden text-xs sm:inline">Side views</span><ChevronDown className="hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center">
            {(['north', 'south', 'east', 'west'] as CameraView[]).map((side) => (
              <DropdownMenuItem key={side} onClick={() => setView(side)} className="capitalize">{side} view</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="mx-1 h-6 w-px bg-border" />
        {action('Edit room', <SlidersHorizontal />, onEditRoom)}
        {action('Materials / Paint', <Paintbrush />, onMaterials)}
        {action('Measure', <Ruler />, toggleMeasure, measure)}
      </div>
    </TooltipProvider>
  );
}

/** On-screen walk pad for touch screens while in eye-level view. */
export function WalkPad() {
  const view = useStudioStore((s) => s.cameraView);
  if (view !== 'eye') return null;
  const hold = (key: 'forward' | 'turn', value: number, icon: React.ReactNode, label: string) => (
    <Button
      variant="glass"
      size="icon"
      aria-label={label}
      className="h-12 w-12 touch-none rounded-full"
      onPointerDown={() => { walkInput[key] = value; }}
      onPointerUp={() => { walkInput[key] = 0; }}
      onPointerLeave={() => { walkInput[key] = 0; }}
      onPointerCancel={() => { walkInput[key] = 0; }}
    >
      {icon}
    </Button>
  );
  return (
    <div className="absolute bottom-24 left-4 z-20 grid grid-cols-3 gap-1">
      <span />{hold('forward', 1, <ArrowUp />, 'Walk forward')}<span />
      {hold('turn', 1, <ArrowLeft />, 'Turn left')}{hold('forward', -1, <ArrowDown />, 'Walk back')}{hold('turn', -1, <ArrowRight />, 'Turn right')}
      <p className="col-span-3 mt-1 rounded-full bg-background/80 px-3 py-1 text-center text-[11px] text-muted-foreground backdrop-blur">Drag to look · WASD to walk</p>
    </div>
  );
}
