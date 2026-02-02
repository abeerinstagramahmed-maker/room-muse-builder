import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
}

export function ProductImageUpload({ 
  images, 
  onImagesChange, 
  disabled 
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not an image`,
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds 5MB limit`,
            variant: 'destructive',
          });
          continue;
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Upload failed',
            description: error.message,
            variant: 'destructive',
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        newUrls.push(urlData.publicUrl);
      }

      if (newUrls.length > 0) {
        onImagesChange([...images, ...newUrls]);
        toast({
          title: 'Images uploaded',
          description: `${newUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, index) => (
            <div 
              key={index} 
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <img 
                src={url} 
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
          uploading && "pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <div>
              <span className="text-sm font-medium text-foreground">Click to upload</span>
              <span className="text-sm"> or drag and drop</span>
            </div>
            <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
          </div>
        )}
      </div>

      {images.length === 0 && (
        <p className="text-xs text-muted-foreground">
          The first image will be used as the main product image
        </p>
      )}
    </div>
  );
}
