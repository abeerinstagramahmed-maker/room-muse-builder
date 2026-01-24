import { Upload, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  uploadedImage: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function ImageUploader({ uploadedImage, onUpload, onClear }: ImageUploaderProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6">
      <label className="block cursor-pointer">
        {uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Your room"
              className="aspect-video w-full rounded-xl object-cover"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
              className="absolute right-2 top-2 rounded-full bg-background/90 p-2 shadow-md hover:bg-background"
              aria-label="Remove image"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-border bg-background">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium">Upload your room photo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              PNG, JPG up to 10MB
            </p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
      </label>
    </div>
  );
}
