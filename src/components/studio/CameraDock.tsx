import { Box, Grid2X2, PanelLeft, Paintbrush, Ruler, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useStudioStore } from '@/stores/studioStore';
import { CameraView } from '@/lib/studioCamera';

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={view !== 'dollhouse' && view !== 'top' ? 'default' : 'ghost'} aria-label="Side views" className="h-11 w-11 shrink-0 rounded-full p-0 sm:w-auto sm:px-3">
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