import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ShowroomCard, Showroom } from '@/components/showroom/ShowroomCard';
import { cn } from '@/lib/utils';

export default function Showrooms() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('showrooms')
        .select('*')
        .order('sort_order', { ascending: true });
      setShowrooms((data as Showroom[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const roomTypes = ['all', ...Array.from(new Set(showrooms.map((s) => s.room_type)))];
  const filtered = filter === 'all' ? showrooms : showrooms.filter((s) => s.room_type === filter);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Virtual Showrooms – Designer Room Templates"
        description="Browse professionally designed virtual showrooms across living rooms, bedrooms, offices and more. Use them as a template or remix your own."
        canonical="/showrooms"
      />
      <Header />
      <main className="container pt-28 pb-16">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Virtual Showrooms</h1>
          <p className="mt-2 text-muted-foreground">
            Start from a professionally designed room — then make it yours.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {roomTypes.map((rt) => (
            <Button
              key={rt}
              size="sm"
              variant={filter === rt ? 'default' : 'outline'}
              onClick={() => setFilter(rt)}
              className={cn('capitalize')}
            >
              {rt}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s) => (
              <ShowroomCard key={s.id} showroom={s} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
