import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GalleryDesign {
  id: string;
  title: string | null;
  description: string | null;
  room_type: string | null;
  share_token: string;
  remix_count: number;
}

export default function Gallery() {
  const { user, isAuthenticated } = useAuth();
  const [designs, setDesigns] = useState<GalleryDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('shared_designs')
      .select('id, title, description, room_type, share_token, remix_count')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    setDesigns((data as GalleryDesign[]) ?? []);

    const { data: likeRows } = await supabase.from('design_likes').select('design_id, user_id');
    const counts: Record<string, number> = {};
    const mine = new Set<string>();
    (likeRows ?? []).forEach((r: { design_id: string; user_id: string }) => {
      counts[r.design_id] = (counts[r.design_id] ?? 0) + 1;
      if (user && r.user_id === user.id) mine.add(r.design_id);
    });
    setLikes(counts);
    setMyLikes(mine);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async (id: string) => {
    if (!isAuthenticated || !user) {
      toast.message('Sign in to like designs.');
      return;
    }
    const liked = myLikes.has(id);
    const nextMine = new Set(myLikes);
    const nextCounts = { ...likes };
    if (liked) {
      nextMine.delete(id);
      nextCounts[id] = Math.max(0, (nextCounts[id] ?? 1) - 1);
      setMyLikes(nextMine);
      setLikes(nextCounts);
      await supabase.from('design_likes').delete().eq('design_id', id).eq('user_id', user.id);
    } else {
      nextMine.add(id);
      nextCounts[id] = (nextCounts[id] ?? 0) + 1;
      setMyLikes(nextMine);
      setLikes(nextCounts);
      await supabase.from('design_likes').insert({ design_id: id, user_id: user.id });
    }
  };

  const roomTypes = ['all', ...Array.from(new Set(designs.map((d) => d.room_type).filter(Boolean) as string[]))];
  const filtered = filter === 'all' ? designs : designs.filter((d) => d.room_type === filter);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Design Gallery – Community Room Designs"
        description="Explore room designs shared by the Roomly community. Like your favorites and remix them into your own studio."
        canonical="/gallery"
      />
      <Header />
      <main className="container pt-28 pb-16">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Design Gallery</h1>
          <p className="mt-2 text-muted-foreground">Get inspired by the community — like and remix designs you love.</p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {roomTypes.map((rt) => (
            <Button key={rt} size="sm" variant={filter === rt ? 'default' : 'outline'} onClick={() => setFilter(rt)} className="capitalize">
              {rt}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No public designs yet. Be the first to share one!</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <Card key={d.id} className="overflow-hidden">
                <Link to={`/shared/${d.share_token}`} className="block aspect-[4/3] bg-gradient-to-br from-muted to-muted-foreground/20" />
                <div className="p-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="truncate font-display font-semibold">{d.title ?? 'Untitled'}</h3>
                    {d.room_type && <Badge variant="secondary" className="shrink-0 capitalize">{d.room_type}</Badge>}
                  </div>
                  {d.description && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>}
                  <div className="flex items-center justify-between">
                    <button onClick={() => toggleLike(d.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <Heart className={cn('h-4 w-4', myLikes.has(d.id) && 'fill-red-500 text-red-500')} />
                      {likes[d.id] ?? 0}
                    </button>
                    <Link to={`/shared/${d.share_token}`}>
                      <Button size="sm" variant="outline">View & Remix</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
