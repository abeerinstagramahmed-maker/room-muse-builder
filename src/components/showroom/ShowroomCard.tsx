import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy } from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { useToast } from '@/hooks/use-toast';

export interface Showroom {
  id: string;
  name: string;
  description: string | null;
  room_type: string;
  thumbnail_url: string | null;
  scene_data: {
    room?: { width: number; depth: number; height: number };
    wallColors?: Record<string, string>;
    flooringId?: string;
    furniture?: unknown[];
  };
  is_featured: boolean;
}

const GRADIENTS: Record<string, string> = {
  'living room': 'from-amber-200 to-orange-300',
  bedroom: 'from-violet-200 to-indigo-300',
  'home office': 'from-slate-300 to-slate-500',
  'dining room': 'from-rose-200 to-amber-200',
  kitchen: 'from-emerald-200 to-teal-300',
};

export function ShowroomCard({ showroom }: { showroom: Showroom }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const loadScene = useStudioStore((s) => s.loadScene);

  const open = (remix: boolean) => {
    loadScene(showroom.scene_data as never);
    if (remix) {
      toast({ title: 'Remixing', description: `Editing a copy of "${showroom.name}".` });
    }
    navigate('/studio');
  };

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        {showroom.thumbnail_url ? (
          <img src={showroom.thumbnail_url} alt={showroom.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${GRADIENTS[showroom.room_type] ?? 'from-muted to-muted-foreground/30'}`}>
            <span className="font-display text-lg font-semibold capitalize text-foreground/70">{showroom.room_type}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" onClick={() => open(false)} className="gap-1">
            <Sparkles className="h-4 w-4" /> Start Designing
          </Button>
        </div>
        {showroom.is_featured && (
          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">Featured</Badge>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="font-display font-semibold">{showroom.name}</h3>
          <Badge variant="secondary" className="shrink-0 capitalize">{showroom.room_type}</Badge>
        </div>
        {showroom.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{showroom.description}</p>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => open(false)}>
            Use as Template
          </Button>
          <Button size="sm" variant="ghost" className="gap-1" onClick={() => open(true)}>
            <Copy className="h-4 w-4" /> Remix
          </Button>
        </div>
      </div>
    </Card>
  );
}
