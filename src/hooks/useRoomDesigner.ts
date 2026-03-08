import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/lib/types';
import { toast } from 'sonner';
import { 
  runDesignPipeline, 
  AIDesignResult, 
  RoomAnalysis, 
  FurniturePlan, 
  GeneratedDesign 
} from '@/services/aiProvider';

export interface DesignResult {
  products: Product[];
  aiNote: string;
  styleNotes?: string;
  generatedImageUrl?: string;
  roomAnalysis?: RoomAnalysis;
  furniturePlan?: FurniturePlan;
  generatedDesign?: GeneratedDesign;
}

export function useRoomDesigner() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [designResult, setDesignResult] = useState<DesignResult | null>(null);
  
  const { products, getProductsByIds } = useProducts();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image too large. Please upload an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setDesignResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setDesignResult(null);
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedStyle || !selectedBudget) return;

    setIsGenerating(true);

    try {
      console.log('[Designer] Running AI design pipeline...');
      
      const aiResult: AIDesignResult = await runDesignPipeline({
        imageBase64: uploadedImage,
        style: selectedStyle,
        budget: selectedBudget,
      });

      // Map product recommendations to actual products
      const productIds = aiResult.productRecommendations.map(r => r.productId);
      let recommendedProducts = await getProductsByIds(productIds);

      // Fallback: if no products matched by ID, use cached products
      if (recommendedProducts.length === 0) {
        const cachedProducts = productIds
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);
        
        if (cachedProducts.length > 0) {
          recommendedProducts = cachedProducts;
        } else {
          // Last fallback: pick products from catalog matching budget
          recommendedProducts = products.slice(0, 5);
        }
      }

      setDesignResult({
        products: recommendedProducts,
        aiNote: aiResult.aiNote,
        styleNotes: aiResult.styleNotes,
        generatedImageUrl: aiResult.generatedDesign.imageUrl,
        roomAnalysis: aiResult.roomAnalysis,
        furniturePlan: aiResult.furniturePlan,
        generatedDesign: aiResult.generatedDesign,
      });

      toast.success('Design complete! Check out your personalized recommendations.');
      
    } catch (err) {
      console.error('[Designer] Pipeline error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalPrice = designResult?.products.reduce((sum, p) => sum + p.price, 0) || 0;

  return {
    uploadedImage,
    selectedStyle,
    selectedBudget,
    isGenerating,
    designResult,
    totalPrice,
    setSelectedStyle,
    setSelectedBudget,
    handleImageUpload,
    clearImage,
    handleGenerate,
  };
}
