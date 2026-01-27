import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

interface DesignResult {
  products: Product[];
  aiNote: string;
  styleNotes?: string;
}

interface AIRecommendation {
  productId: string;
  reason: string;
}

interface AnalyzeRoomResponse {
  success: boolean;
  designNote: string;
  productIds: string[];
  styleNotes: string;
  recommendations: AIRecommendation[];
  error?: string;
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
      // Check file size (max 10MB)
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
      console.log('Calling analyze-room function...');
      
      const { data, error } = await supabase.functions.invoke<AnalyzeRoomResponse>('analyze-room', {
        body: {
          imageBase64: uploadedImage,
          style: selectedStyle,
          budget: selectedBudget,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Failed to analyze room. Please try again.');
        return;
      }

      if (!data?.success) {
        console.error('Analysis failed:', data?.error);
        toast.error(data?.error || 'Failed to generate design recommendations.');
        return;
      }

      // Map product IDs to actual products from database
      const recommendedProducts = await getProductsByIds(data.productIds);

      if (recommendedProducts.length === 0) {
        // Fallback to products from current cache if fetch failed
        const cachedProducts = data.productIds
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);
        
        if (cachedProducts.length === 0) {
          toast.error('No matching products found. Please try a different style.');
          return;
        }
        
        setDesignResult({
          products: cachedProducts,
          aiNote: data.designNote,
          styleNotes: data.styleNotes,
        });
      } else {
        setDesignResult({
          products: recommendedProducts,
          aiNote: data.designNote,
          styleNotes: data.styleNotes,
        });
      }

      toast.success('Design complete! Check out your personalized recommendations.');
      
    } catch (err) {
      console.error('Error generating design:', err);
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
