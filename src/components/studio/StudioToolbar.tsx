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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudioStore } from '@/stores/studioStore';
import { useSavedScenes } from '@/hooks/useSavedScenes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function StudioToolbar() {
  const { isAuthenticated } = useAuth();
  const newRoom = useStudioStore((s) => s.newRoom);
  const requestCameraReset = useStudioStore((s) => s.requestCameraReset);
  const captureScreenshot = useStudioStore((s) => s.captureScreenshot);
  const serialize = useStudioStore((s) => s.serialize);
  const loadScene = useStudioStore((s) => s.loadScene);

  const { scenes, loading, saveScene, renameScene, deleteScene } = useSavedScenes();

  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [sceneName, setSceneName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

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
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={requestCameraReset}
      >
        <Eye className="h-4 w-4" /> Reset View
      </Button>

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
