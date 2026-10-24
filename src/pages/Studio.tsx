import { useEffect, useState } from 'react';
import { Package, SlidersHorizontal, LayoutGrid, X } from 'lucide-react';
import { StartHub } from '@/components/studio/StartHub';
import { useStudioStore } from '@/stores/studioStore';
import { SEOHead } from '@/components/SEOHead';
import { StudioToolbar } from '@/components/studio/StudioToolbar';
import { CatalogSidebar } from '@/components/studio/CatalogSidebar';
import { PropertiesSidebar, PropertiesSection } from '@/components/studio/PropertiesSidebar';
import { RoomEditor } from '@/components/studio/RoomEditor';
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { CameraDock, WalkPad } from '@/components/studio/CameraDock';
import { Button } from '@/components/ui/button';
import { useStudioShortcuts } from '@/hooks/useStudioShortcuts';
import { useIsMobile } from '@/hooks/use-mobile';
import { floorArea } from '@/lib/roomLayout';

/**
 * AI Interior Design Studio — MVP.
 * Desktop shows fixed side panels; on mobile the catalog and properties
 * collapse into slide-in drawers so the 3D canvas fills the screen.
 */
const Studio = () => {
  useStudioShortcuts();
  const isMobile = useIsMobile();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(() => useStudioStore.getState().furniture.length === 0);
  const [section, setSection] = useState<PropertiesSection>('room');
  const selectedId = useStudioStore((s) => s.selectedId);
  const selectedWall = useStudioStore((s) => s.selectedWall);
  const selectedRug = useStudioStore((s) => s.selectedRugId);
  const selectedOpening = useStudioStore((s) => s.selectedOpeningId);
  const room = useStudioStore((s) => s.room);

  useEffect(() => {
    if (selectedId || selectedWall || selectedRug || selectedOpening) {
      setCatalogOpen(false);
      setPropsOpen(true);
    }
  }, [selectedId, selectedWall, selectedRug, selectedOpening]);

  const openProperties = (next: PropertiesSection) => {
    setSection(next);
    setCatalogOpen(false);
    setPropsOpen(true);
  };
  const toggleCatalog = () => { setCatalogOpen(!catalogOpen); setPropsOpen(false); };

  return (
    <>
      <SEOHead
        title="3D Room Studio | Design Your Space"
        description="Plan your room in 3D: adjust dimensions, paint walls, choose flooring, and place furniture from the catalog. Save and export your designs."
      />
      <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-background">
        <StudioToolbar />
        <StartHub open={hubOpen} onOpenChange={setHubOpen} />
        <main className="relative min-h-0 min-w-0 flex-1">
          <RoomEditor />
          <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2 sm:inset-x-5 sm:top-5">
            <Button variant="glass" className="h-11 rounded-full shadow-card" aria-expanded={catalogOpen} onClick={toggleCatalog}><Package /> Catalog</Button>
            <div className="hidden rounded-full bg-background/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur sm:block">{room.width}′ × {room.depth}′ · {floorArea(room)} sq.ft{room.notch ? ' · L-shaped' : ''}</div>
            <div className="flex gap-2">
              <Button size="icon" variant="glass" className="h-11 w-11 rounded-full" aria-label="Properties" aria-expanded={propsOpen} onClick={() => propsOpen ? setPropsOpen(false) : openProperties('room')}><SlidersHorizontal /></Button>
              <Button variant="glass" className="h-11 rounded-full shadow-card" onClick={() => setHubOpen(true)}><LayoutGrid /><span className="hidden sm:inline">Change room</span></Button>
            </div>
          </div>
          <WalkPad />
          <CameraDock onEditRoom={() => openProperties('room')} onMaterials={() => openProperties('materials')} />
          {!isMobile && catalogOpen && <section aria-label="Catalog drawer" className="absolute bottom-24 left-4 top-20 z-20 flex w-80 flex-col overflow-hidden rounded-lg bg-card shadow-elevated">
            <div className="flex items-center justify-between px-4 pt-2"><span className="text-xs text-muted-foreground">Furnish your room</span><Button variant="ghost" size="icon" aria-label="Close catalog" onClick={() => setCatalogOpen(false)}><X /></Button></div>
            <CatalogSidebar />
          </section>}
          {!isMobile && propsOpen && <section aria-label="Properties drawer" className="absolute bottom-24 right-4 top-20 z-20 flex w-80 flex-col overflow-hidden rounded-lg bg-card shadow-elevated">
            <div className="flex items-center justify-between px-4 pt-2"><span className="text-sm font-semibold">Properties</span><Button variant="ghost" size="icon" aria-label="Close properties" onClick={() => setPropsOpen(false)}><X /></Button></div>
            <PropertiesSidebar section={section} onSectionChange={setSection} />
          </section>}
        </main>
        {isMobile && <Drawer open={catalogOpen || propsOpen} onOpenChange={(open) => { if (!open) { setCatalogOpen(false); setPropsOpen(false); } }} shouldScaleBackground={false}>
          <DrawerContent className="h-[78dvh]">
            <div className="flex items-center justify-between px-4"><DrawerTitle>{catalogOpen ? 'Catalog' : 'Properties'}</DrawerTitle><DrawerClose asChild><Button variant="ghost" size="icon" aria-label="Close drawer"><X /></Button></DrawerClose></div>
            <div className="min-h-0 flex-1 overflow-hidden">{catalogOpen ? <CatalogSidebar /> : <PropertiesSidebar section={section} onSectionChange={setSection} />}</div>
          </DrawerContent>
        </Drawer>}
      </div>
    </>
  );
};

export default Studio;
