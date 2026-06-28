import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SceneViewer } from '@/components/studio/SceneViewer';
import { useStudioStore } from '@/stores/studioStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { SceneData } from '@/types/studio';

interface SharedDesignRow {
  id: string;
  title: string | null;
  description: string | null;
  room_type: string | null;
  scene_data: SceneData;
  remix_count: number;
}

export default function SharedDesign() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const loadScene = useStudioStore((s) => s.loadScene);

  const [design, setDesign] = useState<SharedDesignRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('shared_designs')
        .select('*')
        .eq('share_token', token)
        .maybeSingle();
      setDesign((data as unknown as SharedDesignRow) ?? null);
      setLoading(false);
    })();
  }, [token]);

  const handleRemix = async () => {
    if (!design) return;
    if (!isAuthenticated) {
      toast.message('Sign up to remix this design.');
      navigate('/auth');
      return;
    }
    loadScene(design.scene_data);
    await supabase.rpc('increment_remix_count', { p_design_id: design.id });
    toast.success('Design copied to your studio.');
    navigate('/studio');
  };

  const furniture = design?.scene_data?.furniture ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={design?.title ? `${design.title} – Shared Design` : 'Shared Design'}
        description={design?.description ?? 'View and remix this 3D room design.'}
        canonical={`/shared/${token}`}
      />
      <Header />
      <main className="container pt-24 pb-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !design ? (
          <div className="py-24 text-center">
            <h1 className="font-display text-2xl font-bold">Design not found</h1>
            <p className="mt-2 text-muted-foreground">This design may be private or no longer exists.</p>
            <Button className="mt-6" onClick={() => navigate('/gallery')}>Browse the Gallery</Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold">{design.title ?? 'Untitled Design'}</h1>
                  {design.room_type && (
                    <Badge variant="secondary" className="mt-1 capitalize">{design.room_type}</Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{design.remix_count} remixes</span>
              </div>
              <Card className="h-[60vh] overflow-hidden">
                <SceneViewer scene={design.scene_data} />
              </Card>
            </div>

            <aside className="space-y-4">
              {design.description && (
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">{design.description}</p>
                </Card>
              )}
              <Button className="w-full gap-2" onClick={handleRemix}>
                <Copy className="h-4 w-4" /> Remix This Design
              </Button>

              <Card className="p-4">
                <h2 className="mb-2 font-semibold">Items in this room</h2>
                {furniture.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No catalog items listed.</p>
                ) : (
                  <ul className="space-y-2">
                    {furniture.map((f, i) => (
                      <li key={f.instanceId ?? i} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">{f.name ?? 'Item'}</span>
                        {f.productId && (
                          <Link to={`/product/${f.productId}`} className="shrink-0 text-primary hover:underline">
                            <ShoppingBag className="h-4 w-4" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
