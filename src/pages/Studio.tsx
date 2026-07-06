import { useState } from 'react';
import { Package, SlidersHorizontal } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { StudioToolbar } from '@/components/studio/StudioToolbar';
import { CatalogSidebar } from '@/components/studio/CatalogSidebar';
import { PropertiesSidebar } from '@/components/studio/PropertiesSidebar';
import { RoomEditor } from '@/components/studio/RoomEditor';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useStudioShortcuts } from '@/hooks/useStudioShortcuts';
import { useIsMobile } from '@/hooks/use-mobile';

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

  return (
    <>
      <SEOHead
        title="3D Room Studio | Design Your Space"
        description="Plan your room in 3D: adjust dimensions, paint walls, choose flooring, and place furniture from the catalog. Save and export your designs."
      />
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <StudioToolbar />

        {isMobile ? (
          <main className="relative min-h-0 flex-1">
            <RoomEditor />

            {/* Floating drawer triggers */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-3">
              <Sheet open={catalogOpen} onOpenChange={setCatalogOpen}>
                <SheetTrigger asChild>
                  <Button className="pointer-events-auto gap-2 shadow-lg">
                    <Package className="h-4 w-4" /> Catalog
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <CatalogSidebar />
                </SheetContent>
              </Sheet>

              <Sheet open={propsOpen} onOpenChange={setPropsOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" className="pointer-events-auto gap-2 shadow-lg">
                    <SlidersHorizontal className="h-4 w-4" /> Properties
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <PropertiesSidebar />
                </SheetContent>
              </Sheet>
            </div>
          </main>
        ) : (
          <div className="flex min-h-0 flex-1">
            <CatalogSidebar />
            <main className="relative min-w-0 flex-1">
              <RoomEditor />
            </main>
            <PropertiesSidebar />
          </div>
        )}
      </div>
    </>
  );
};

export default Studio;
