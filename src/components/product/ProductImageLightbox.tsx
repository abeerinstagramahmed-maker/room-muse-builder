import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageLightboxProps {
  images: string[];
  productName: string;
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductImageLightbox({ images, productName, initialIndex = 0, open, onOpenChange }: ProductImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('center center');
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  const handleNext = () => setCurrentIndex((i) => (i + 1) % images.length);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!zoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setTransformOrigin(`${x}% ${y}%`);
    }
    setZoomed(!zoomed);
  };

  // Reset state when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomed(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/95 sm:max-w-5xl [&>button]:hidden">
        <div className="relative flex items-center justify-center h-[90vh]">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-50 rounded-full bg-background/20 p-2 text-white backdrop-blur-sm hover:bg-background/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 z-50 rounded-full bg-background/20 p-2 text-white backdrop-blur-sm hover:bg-background/40 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 z-50 rounded-full bg-background/20 p-2 text-white backdrop-blur-sm hover:bg-background/40 transition-colors top-1/2 -translate-y-1/2"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="overflow-auto w-full h-full flex items-center justify-center">
            <img
              ref={imgRef}
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              onClick={handleImageClick}
              className={cn(
                "max-h-full max-w-full object-contain transition-transform duration-300",
                zoomed ? "scale-200 cursor-zoom-out" : "cursor-zoom-in"
              )}
              style={{ transformOrigin }}
            />
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
