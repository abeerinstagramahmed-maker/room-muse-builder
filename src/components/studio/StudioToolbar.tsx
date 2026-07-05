import { useState } from 'react';
import {
  FilePlus2,
  Save,
  FolderOpen,
  Camera,
  Eye,
  Loader2,
  Trash2,
  Pencil,
  Check,
  Share2,
  Copy,
  Undo2,
  Redo2,
  Magnet,
  Ruler,
  AlertTriangle,
  Map as MapIcon,
  ListChecks,
  Eraser,
  LayoutTemplate,
  ShoppingCart,
  Sofa,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudioStore } from '@/stores/studioStore';
import { useSavedScenes } from '@/hooks/useSavedScenes';
import { useAuth } from '@/hooks/useAuth';
import { ROOM_TEMPLATES } from '@/lib/roomTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useStudioProducts } from '@/hooks/useStudioProducts';
import { studioProductToProduct } from '@/lib/studioCart';
import { CartDrawer } from '@/components/studio/CartDrawer';
import { toast } from 'sonner';

export function StudioToolbar() {
  const { isAuthenticated, user } = useAuth();
  const newRoom = useStudioStore((s) => s.newRoom);
  const requestCameraReset = useStudioStore((s) => s.requestCameraReset);
  const captureScreenshot = useStudioStore((s) => s.captureScreenshot);
  const serialize = useStudioStore((s) => s.serialize);
  const loadScene = useStudioStore((s) => s.loadScene);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const canUndo = useStudioStore((s) => s.past.length > 0);
  const canRedo = useStudioStore((s) => s.future.length > 0);
  const snapEnabled = useStudioStore((s) => s.snapEnabled);
  const toggleSnap = useStudioStore((s) => s.toggleSnap);
  const measureMode = useStudioStore((s) => s.measureMode);
  const collisionEnabled = useStudioStore((s) => s.collisionEnabled);
  const toggleCollision = useStudioStore((s) => s.toggleCollision);
  const collidingCount = useStudioStore((s) => s.collidingIds.length);
  const toggleMeasureMode = useStudioStore((s) => s.toggleMeasureMode);
  const measurements = useStudioStore((s) => s.measurements);
  const clearMeasurements = useStudioStore((s) => s.clearMeasurements);
  const applyTemplate = useStudioStore((s) => s.applyTemplate);
  const furniture = useStudioStore((s) => s.furniture);
  const { addItem, totalItems } = useCart();
  const { data: products = [] } = useStudioProducts();
  const [cartOpen, setCartOpen] = useState(false);

  const roomProducts = furniture
    .map((f) => products.find((p) => p.id === f.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const roomTotal = roomProducts.reduce((sum, p) => sum + p.price, 0);

  const buyThisRoom = () => {
    if (roomProducts.length === 0) {
      toast.error('Place some furniture first.');
      return;
    }
    roomProducts.forEach((p) => addItem(studioProductToProduct(p)));
    setCartOpen(true);
  };


  const { scenes, loading, saveScene, renameScene, deleteScene } = useSavedScenes();

  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [sceneName, setSceneName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [shareOpen, setShareOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDesc, setShareDesc] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const handleShare = async () => {
    if (!user) return;
    setSharing(true);
    const token = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, '').slice(0, 16);
    const { error } = await supabase.from('shared_designs').insert({
      user_id: user.id,
      scene_data: serialize() as never,
      title: shareTitle.trim() || 'Untitled Design',
      description: shareDesc.trim() || null,
      share_token: token,
      is_public: true,
    });
    setSharing(false);
    if (error) {
      toast.error('Could not share design.');
      return;
    }
    setShareUrl(`${window.location.origin}/shared/${token}`);
  };

  const socialShare = (network: 'twitter' | 'facebook' | 'pinterest') => {
    if (!shareUrl) return;
    const u = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareTitle || 'Check out my room design!');
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${u}&description=${text}`,
    };
    window.open(urls[network], '_blank', 'noopener,width=600,height=500');
  };


  const handleSave = async () => {
    if (!sceneName.trim()) return;
    setSaving(true);
    const ok = await saveScene(sceneName.trim(), serialize());
    setSaving(false);
    if (ok) {
      setSaveOpen(false);
      setSceneName('');
    }
  };

  const handleScreenshot = () => {
    if (captureScreenshot) captureScreenshot();
    else toast.error('Editor is not ready yet.');
  };

  const handleFloorPlan = () => {
    const room = useStudioStore.getState().room;
    const svg = buildFloorPlanSVG(room, furniture);
    downloadTextFile(`floor-plan-${Date.now()}.svg`, svg, 'image/svg+xml');
    toast.success('Floor plan exported.');
  };

  const handleShoppingList = () => {
    if (furniture.length === 0) return toast.error('Add furniture first.');
    const csv = buildShoppingListCSV(furniture);
    downloadTextFile(`shopping-list-${Date.now()}.csv`, csv, 'text/csv');
    toast.success('Shopping list exported.');
  };

  return (
    <div className="flex items-center gap-1.5 border-b bg-card px-4 py-2">
      <h1 className="mr-4 text-sm font-bold tracking-tight">Room Studio</h1>

      <Button variant="ghost" size="sm" className="gap-1.5" onClick={newRoom}>
        <FilePlus2 className="h-4 w-4" /> New Room
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => setTemplatesOpen(true)}
      >
        <LayoutTemplate className="h-4 w-4" /> Templates
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Redo (Ctrl+Shift+Z)"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 className="h-4 w-4" />
      </Button>
      <Button
        variant={snapEnabled ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        title="Toggle snapping"
        onClick={toggleSnap}
      >
        <Magnet className="h-4 w-4" />
      </Button>
      <Button
        variant={measureMode ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        title="Measure (click two points)"
        onClick={toggleMeasureMode}
      >
        <Ruler className="h-4 w-4" />
      </Button>
      <Button
        variant={collisionEnabled ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        title="Toggle collision detection"
        onClick={toggleCollision}
      >
        <AlertTriangle
          className={collidingCount > 0 ? 'h-4 w-4 text-destructive' : 'h-4 w-4'}
        />
      </Button>
      {measurements.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Clear all measurements"
          onClick={clearMeasurements}
        >
          <Eraser className="h-4 w-4" />
        </Button>
      )}
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          if (!isAuthenticated) return toast.error('Please sign in to save scenes.');
          setSaveOpen(true);
        }}
      >
        <Save className="h-4 w-4" /> Save Scene
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          if (!isAuthenticated) return toast.error('Please sign in to load scenes.');
          setLoadOpen(true);
        }}
      >
        <FolderOpen className="h-4 w-4" /> Load Scene
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleScreenshot}>
        <Camera className="h-4 w-4" /> Screenshot
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleFloorPlan}>
        <Map className="h-4 w-4" /> Floor Plan
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={handleShoppingList}
      >
        <ListChecks className="h-4 w-4" /> Shopping List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={requestCameraReset}
      >
        <Eye className="h-4 w-4" /> Reset View
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          if (!isAuthenticated) return toast.error('Please sign in to share designs.');
          setShareUrl(null);
          setShareOpen(true);
        }}
      >
        <Share2 className="h-4 w-4" /> Share
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        title={roomTotal > 0 ? `Add all placed furniture ($${roomTotal.toFixed(0)}) to cart` : undefined}
        onClick={buyThisRoom}
      >
        <Sofa className="h-4 w-4" /> Buy This Room
        {roomTotal > 0 && (
          <span className="text-xs text-muted-foreground">${roomTotal.toFixed(0)}</span>
        )}
      </Button>

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          title="Cart"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />



      {/* Templates dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start From a Template</DialogTitle>
            <DialogDescription>
              Pick a room type to set dimensions, wall colour and flooring.
              This replaces your current scene.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {ROOM_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  applyTemplate(t);
                  setTemplatesOpen(false);
                  toast.success(`Started "${t.label}" template.`);
                }}
                className="flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: t.wallColor }}
                  />
                  <span className="text-sm font-medium">{t.label}</span>
                </span>
                <span className="text-xs text-muted-foreground">{t.description}</span>
                <span className="text-[11px] text-muted-foreground">
                  {t.room.width}′ × {t.room.depth}′ × {t.room.height}′
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Design</DialogTitle>
          </DialogHeader>
          {!shareUrl ? (
            <div className="space-y-3">
              <Input
                placeholder="Design title"
                value={shareTitle}
                onChange={(e) => setShareTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={shareDesc}
                onChange={(e) => setShareDesc(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShareOpen(false)}>Cancel</Button>
                <Button onClick={handleShare} disabled={sharing}>
                  {sharing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Share Link
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input readOnly value={shareUrl} />
                <Button
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied!');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => socialShare('twitter')}>Twitter</Button>
                <Button variant="outline" className="flex-1" onClick={() => socialShare('facebook')}>Facebook</Button>
                <Button variant="outline" className="flex-1" onClick={() => socialShare('pinterest')}>Pinterest</Button>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Embed code</p>
                <Textarea
                  readOnly
                  className="font-mono text-xs"
                  value={`<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Save dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Scene</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Scene name"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !sceneName.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load dialog */}
      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saved Scenes</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {!loading && scenes.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No saved scenes yet.
              </p>
            )}
            <div className="space-y-2">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-2.5"
                >
                  {editingId === scene.id ? (
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          renameScene(scene.id, editName.trim() || scene.name);
                          setEditingId(null);
                        }
                      }}
                      className="h-8"
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{scene.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scene.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {editingId === scene.id ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          renameScene(scene.id, editName.trim() || scene.name);
                          setEditingId(null);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingId(scene.id);
                          setEditName(scene.name);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteScene(scene.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        loadScene(scene.scene_data);
                        setLoadOpen(false);
                        toast.success(`Loaded "${scene.name}".`);
                      }}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
