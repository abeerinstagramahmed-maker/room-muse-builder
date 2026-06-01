import { SEOHead } from '@/components/SEOHead';
import { StudioToolbar } from '@/components/studio/StudioToolbar';
import { CatalogSidebar } from '@/components/studio/CatalogSidebar';
import { PropertiesSidebar } from '@/components/studio/PropertiesSidebar';
import { RoomEditor } from '@/components/studio/RoomEditor';

/**
 * AI Interior Design Studio — MVP.
 * Desktop-first 3D furniture room planner. AI capabilities are wired but
 * disabled (see src/services/ai).
 */
const Studio = () => {
  return (
    <>
      <SEOHead
        title="3D Room Studio | Design Your Space"
        description="Plan your room in 3D: adjust dimensions, paint walls, choose flooring, and place furniture from the catalog. Save and export your designs."
      />
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <StudioToolbar />
        <div className="flex min-h-0 flex-1">
          <CatalogSidebar />
          <main className="relative min-w-0 flex-1">
            <RoomEditor />
          </main>
          <PropertiesSidebar />
        </div>
      </div>
    </>
  );
};

export default Studio;
