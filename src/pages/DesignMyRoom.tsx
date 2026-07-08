import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, Loader2, Eraser, Wand2, ImageIcon, X, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useStudioStore } from '@/stores/studioStore';
import { cn } from '@/lib/utils';

interface RoomAnalysis {
  room_type: string;
  estimated_width: number;
  estimated_depth: number;
  estimated_height: number;
  wall_color: string;
  floor_type: string;
  detected_furniture: string[];
  style_suggestions: string[];
  lighting_conditions: string;
}

interface Suggestion {
  slot: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  size: [number, number, number];
  position: [number, number, number];
  reason: string;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

export default function DesignMyRoom() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthContext();
  const applyRoomAnalysis = useStudioStore((s) => s.applyRoomAnalysis);
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      toast({ title: 'Unsupported file', description: 'Use JPEG, PNG, HEIC, or WebP.', variant: 'destructive' });
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setAnalysis(null);
    setSuggestions([]);
    setCleanedUrl(null);
    setUploadedUrl(null);
  }, [toast]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const ensureUploaded = async (): Promise<string | null> => {
    if (uploadedUrl) return uploadedUrl;
    if (!file || !user) return null;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('room-photos').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return null;
    }
    const { data } = await supabase.storage.from('room-photos').createSignedUrl(path, 3600);
    const url = data?.signedUrl ?? null;
    setUploadedUrl(url);
    return url;
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setAnalyzing(true);
    try {
      const url = await ensureUploaded();
      if (!url) return;
      const { data, error } = await supabase.functions.invoke('analyze-room', {
        body: { imageUrl: url },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data.analysis as RoomAnalysis);
      toast({ title: 'Room analyzed', description: 'AI detected your room details.' });
    } catch (e: unknown) {
      toast({
        title: 'Analysis failed',
        description: e instanceof Error ? e.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleErase = async () => {
    setErasing(true);
    try {
      const url = await ensureUploaded();
      if (!url) return;
      const { data, error } = await supabase.functions.invoke('erase-furniture', {
        body: { imageUrl: url },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCleanedUrl(data.cleanedImageUrl);
      toast({ title: 'Furniture erased', description: 'A cleaned room image is ready.' });
    } catch (e: unknown) {
      toast({
        title: 'Eraser failed',
        description: e instanceof Error ? e.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setErasing(false);
    }
  };

  const handleSuggest = async () => {
    if (!analysis) return;
    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-furniture', {
        body: {
          roomType: analysis.room_type,
          width: analysis.estimated_width,
          depth: analysis.estimated_depth,
        },
      });
      if (error) throw error;
      const list = (data?.suggestions as Suggestion[]) ?? [];
      setSuggestions(list);
      setSelectedIds(new Set(list.map((s) => s.productId)));
    } catch (e: unknown) {
      toast({
        title: 'Could not load suggestions',
        description: e instanceof Error ? e.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setSuggesting(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDesignInStudio = () => {
    if (!analysis) return;
    // If AI suggested products, open the review step so the user can confirm
    // which items get placed before entering the studio.
    if (suggestions.length > 0) {
      setReviewOpen(true);
      return;
    }
    applyDesign([]);
  };

  const applyDesign = (chosen: Suggestion[]) => {
    if (!analysis) return;
    applyRoomAnalysis({
      room: {
        width: Number(analysis.estimated_width) || 15,
        depth: Number(analysis.estimated_depth) || 20,
        height: Number(analysis.estimated_height) || 9,
      },
      wallColor: analysis.wall_color,
      backgroundImageUrl: cleanedUrl,
      furniture: chosen.map((s) => ({
        productId: s.productId,
        name: s.name,
        category: s.slot,
        modelUrl: null,
        size: s.size,
        position: s.position,
        rotationY: 0,
        scale: 1,
      })),
    });
    navigate('/studio');
  };

  const confirmReview = () => {
    const chosen = suggestions.filter((s) => selectedIds.has(s.productId));
    setReviewOpen(false);
    applyDesign(chosen);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Design My Room – Upload & AI Analysis"
        description="Upload a photo of your room and let AI detect its layout, colors, and style, then design it in 3D."
        canonical="/design-my-room"
      />
      <Header />
      <main className="container max-w-5xl pt-28 pb-16">
        <div className="mb-8 text-center">
          <Badge className="mb-3 gap-1 bg-gradient-to-r from-primary to-ai-coral text-white">
            <Sparkles className="h-3.5 w-3.5" /> AI Room Analysis
          </Badge>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Design My Room</h1>
          <p className="mt-2 text-muted-foreground">
            Upload a photo of your space. AI detects the room type, dimensions, colors and style — then you design it in 3D.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload / preview */}
          <Card className="p-4">
            {!previewUrl ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  'flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                  dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                )}
              >
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">Drag & drop a room photo</p>
                <p className="text-sm text-muted-foreground">or click to browse — JPEG, PNG, HEIC, WebP</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={cleanedUrl || previewUrl}
                  alt="Room preview"
                  className="max-h-[420px] w-full rounded-xl object-contain"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-2"
                  onClick={() => { setFile(null); setPreviewUrl(null); setAnalysis(null); setSuggestions([]); setCleanedUrl(null); setUploadedUrl(null); }}
                >
                  <X className="h-4 w-4" />
                </Button>
                {cleanedUrl && (
                  <Badge className="absolute left-2 top-2 bg-primary/90 text-white">Furniture erased</Badge>
                )}
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={handleAnalyze} disabled={!file || analyzing} className="gap-2">
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Room
              </Button>
              <Button variant="outline" onClick={handleErase} disabled={!file || erasing} className="gap-2">
                {erasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
                Erase Furniture
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-4">
            {!analysis ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center text-muted-foreground">
                <ImageIcon className="mb-3 h-10 w-10" />
                <p>Analysis results will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-semibold capitalize">{analysis.room_type}</h2>
                  <p className="text-sm text-muted-foreground">
                    ~{analysis.estimated_width} × {analysis.estimated_depth} × {analysis.estimated_height} ft
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 rounded-full border" style={{ background: analysis.wall_color }} />
                    Walls {analysis.wall_color}
                  </div>
                  <div className="capitalize">Floor: {analysis.floor_type}</div>
                  <div className="capitalize">Lighting: {analysis.lighting_conditions}</div>
                </div>
                {analysis.detected_furniture?.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Detected furniture</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.detected_furniture.map((f) => (
                        <Badge key={f} variant="secondary" className="capitalize">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.style_suggestions?.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Style suggestions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.style_suggestions.map((s) => (
                        <Badge key={s} className="bg-ai-coral/10 text-ai-coral">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" onClick={handleSuggest} disabled={suggesting} className="gap-2">
                    {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    AI Furniture Suggestions
                  </Button>
                  <Button onClick={handleDesignInStudio} className="gap-2 bg-gradient-to-r from-primary to-ai-coral text-white">
                    <Sparkles className="h-4 w-4" /> Design in Studio
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Suggestions grid */}
        {suggestions.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 font-display text-lg font-semibold">AI Suggested Products</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {suggestions.map((s) => (
                <Card key={s.productId} className="overflow-hidden">
                  {s.imageUrl && (
                    <img src={s.imageUrl} alt={s.name} className="aspect-square w-full object-cover" />
                  )}
                  <div className="p-2">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{s.slot}</p>
                    <p className="text-sm font-semibold">${Number(s.price).toFixed(2)}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
