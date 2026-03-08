/**
 * AI Provider Service Layer
 * 
 * Modular abstraction over multiple AI providers (Replicate, OpenAI, Anthropic).
 * Enhanced with multi-factor product scoring, placement data, and room fit analysis.
 */

import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import type { PipelineStep } from '@/hooks/useRoomDesigner';

// ─── Types ───────────────────────────────────────────────────────────

export interface DetectedFurniture {
  label: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  category: string;
}

export interface RoomAnalysis {
  roomType: string;
  description: string;
  detectedFurniture: DetectedFurniture[];
  lighting: string;
  colorPalette: string[];
  layoutNotes: string;
}

export interface FurniturePlanItem {
  type: string;
  placement: string;
  reason: string;
  priority: 'must-have' | 'nice-to-have';
}

export interface FurniturePlan {
  roomStyle: string;
  budget: string;
  recommendedFurniture: FurniturePlanItem[];
  removalSuggestions: string[];
}

export interface PlacementPosition {
  x: number;
  y: number;
  scale: number;
}

export interface PlacementPlanItem {
  type: string;
  placement: string;
  position: PlacementPosition;
  layer: number;
  shadow: boolean;
  perspective: string;
}

export interface GeneratedDesign {
  imageUrl: string;
  prompt: string;
  controlNetType: 'depth' | 'canny';
  placementPlan?: PlacementPlanItem[];
  compositeMethod?: string;
  metadata?: {
    roomType: string;
    detectedItemCount: number;
    placedItemCount: number;
    styleApplied: string;
    budgetTier: string;
  };
}

export interface ScoreBreakdown {
  styleScore: number;
  budgetScore: number;
  qualityScore: number;
  materialScore: number;
  fitScore: number;
}

export interface ProductRecommendation {
  productId: string;
  name: string;
  price: number;
  commissionPrice: number;
  image: string;
  storeSource: string;
  purchaseLink: string;
  category: string;
  styleTags: string[];
  rating: number;
  reviewCount: number;
  material: string;
  dimensions?: Record<string, number>;
  colors: string[];
  matchScore: number;
  scoreBreakdown?: ScoreBreakdown;
  furnitureType: string;
  placement: string;
  reason: string;
}

export interface AIDesignResult {
  roomAnalysis: RoomAnalysis;
  furniturePlan: FurniturePlan;
  generatedDesign: GeneratedDesign;
  productRecommendations: ProductRecommendation[];
  aiNote: string;
  styleNotes: string;
}

export type AIProvider = 'replicate' | 'openai' | 'anthropic';

// ─── Edge Function Callers ───────────────────────────────────────────

async function callEdgeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw new Error(`Edge function "${name}" failed: ${error.message}`);
  return data as T;
}

// ─── Public API ──────────────────────────────────────────────────────

export async function analyzeRoom(imageBase64: string): Promise<RoomAnalysis> {
  return callEdgeFunction<RoomAnalysis>('analyze-room-image', { imageBase64 });
}

export async function detectFurniture(imageBase64: string): Promise<DetectedFurniture[]> {
  const result = await callEdgeFunction<{ objects: DetectedFurniture[] }>('detect-furniture', { imageBase64 });
  return result.objects;
}

export async function generateRoomDesign(params: {
  imageBase64: string;
  style: string;
  budget: string;
  roomAnalysis: RoomAnalysis;
  furniturePlan: FurniturePlan;
}): Promise<GeneratedDesign> {
  return callEdgeFunction<GeneratedDesign>('generate-room-design', params);
}

export async function recommendProducts(params: {
  furniturePlan: FurniturePlan;
  style: string;
  budget: string;
}): Promise<ProductRecommendation[]> {
  const result = await callEdgeFunction<{ recommendations: ProductRecommendation[] }>('recommend-products', params);
  return result.recommendations;
}

/**
 * Full AI design pipeline — orchestrates all steps with progress callbacks.
 */
export async function runDesignPipeline(params: {
  imageBase64: string;
  style: string;
  budget: string;
  onStepChange?: (step: PipelineStep) => void;
}): Promise<AIDesignResult> {
  const { imageBase64, style, budget, onStepChange } = params;
  const step = onStepChange || (() => {});

  // Step 1 & 2: Analyze room + detect furniture (parallel)
  step('analyzing');
  const [roomAnalysis, detectedFurniture] = await Promise.all([
    analyzeRoom(imageBase64),
    detectFurniture(imageBase64),
  ]);

  // Merge detected furniture into analysis
  roomAnalysis.detectedFurniture = detectedFurniture;

  // Step 3: Generate furniture plan
  step('planning');
  const furniturePlan = await callEdgeFunction<FurniturePlan>('recommend-products', {
    roomAnalysis,
    style,
    budget,
    planOnly: true,
  });

  // Step 4: Generate room image with placement data
  step('generating');
  const generatedDesign = await generateRoomDesign({ imageBase64, style, budget, roomAnalysis, furniturePlan });

  // Step 5: Enhanced product recommendations with scoring
  step('matching');
  const productRecommendations = await recommendProducts({ furniturePlan, style, budget });

  const mustHaveCount = furniturePlan.recommendedFurniture.filter(f => f.priority === 'must-have').length;
  const topMatchScore = productRecommendations.length > 0 
    ? Math.round(productRecommendations[0].matchScore * 100) 
    : 0;

  return {
    roomAnalysis,
    furniturePlan,
    generatedDesign,
    productRecommendations,
    aiNote: `We analyzed your ${roomAnalysis.roomType.replace('-', ' ')} and created a ${style} design within your ${budget} budget. Detected ${detectedFurniture.length} existing items, planned ${furniturePlan.recommendedFurniture.length} pieces (${mustHaveCount} essential). Top product match: ${topMatchScore}%.`,
    styleNotes: roomAnalysis.layoutNotes,
  };
}

// ─── AI Settings helpers ─────────────────────────────────────────────

export interface AISettings {
  replicateApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  roomAnalysisModel: string;
  furnitureDetectionModel: string;
  roomGenerationModel: string;
  productRecommendationModel: string;
  enableAIGeneration: boolean;
  enableFurnitureDetection: boolean;
  enableProductScraping: boolean;
}

export const defaultAISettings: AISettings = {
  replicateApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  roomAnalysisModel: 'blip2',
  furnitureDetectionModel: 'grounding-dino-sam',
  roomGenerationModel: 'sdxl-controlnet',
  productRecommendationModel: 'gpt-4o-mini',
  enableAIGeneration: true,
  enableFurnitureDetection: true,
  enableProductScraping: true,
};
