import { useRef, useState } from 'react';
import { Box, Link2, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MAX_BYTES = 50 * 1024 * 1024;

interface Props {
  modelUrl: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ProductModelUpload({ modelUrl, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const upload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      toast({ title: 'Invalid file', description: 'Only .glb or .gltf files are supported', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: 'File too large', description: '3D models must be under 50 MB', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('models-3d').upload(path, file, {
        cacheControl: '31536000',
        contentType: ext === 'glb' ? 'model/gltf-binary' : 'model/gltf+json',
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('models-3d').getPublicUrl(path);
      onChange(data.publicUrl);
      toast({ title: '3D model uploaded', description: `${file.name} (${(file.size / 1048576).toFixed(1)} MB)` });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyLink = () => {
    const url = linkInput.trim();
    if (!/^https:\/\/.+\.(glb|gltf)(\?.*)?$/i.test(url)) {
      toast({ title: 'Invalid link', description: 'Use an https link ending in .glb or .gltf', variant: 'destructive' });
      return;
    }
    onChange(url);
    setLinkInput('');
  };

  const fileName = modelUrl ? decodeURIComponent(modelUrl.split('/').pop()?.split('?')[0] ?? '') : '';

  return (
    <div className="space-y-3">
      {modelUrl ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Box className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">3D ready — shown in the Studio</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
            Replace
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={() => onChange(null)} aria-label="Remove 3D model">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f && !disabled) upload(f);
          }}
          className={cn(
            'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-muted/50',
            dragOver && 'border-primary bg-muted/50',
            (disabled || uploading) && 'pointer-events-none opacity-60',
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Uploading 3D model...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <span className="text-sm"><span className="font-medium text-foreground">Click to upload</span> or drag a 3D model</span>
              <span className="text-xs">GLB or GLTF up to 50 MB · optional (a built-in shape is used otherwise)</span>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        disabled={disabled || uploading}
      />
      <div className="flex gap-2">
        <Input
          placeholder="Or paste an https link to a .glb file"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          disabled={disabled}
        />
        <Button type="button" variant="outline" onClick={applyLink} disabled={disabled || !linkInput}>
          <Link2 className="mr-1 h-4 w-4" /> Use link
        </Button>
      </div>
    </div>
  );
}
