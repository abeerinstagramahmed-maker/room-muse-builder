import { Sparkles, ShoppingBag, Check, ImageIcon, Eye, Star, ExternalLink, Ruler, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { RoomAnalysis, FurniturePlan, GeneratedDesign, ProductRecommendation } from '@/services/aiProvider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { PipelineStep } from '@/hooks/useRoomDesigner';

const PIPELINE_STEPS: { key: PipelineStep; label: string }[] = [
  { key: 'analyzing', label: 'Analyzing Room' },
  { key: 'detecting', label: 'Detecting Furniture' },
  { key: 'planning', label: 'Planning Layout' },
  { key: 'generating', label: 'Generating Design' },
  { key: 'matching', label: 'Matching Products' },
];

function getStepIndex(step: PipelineStep): number {
  const idx = PIPELINE_STEPS.findIndex(s => s.key === step);
  return idx >= 0 ? idx : -1;
}

interface DesignResultsProps {
  isGenerating: boolean;
  pipelineStep: PipelineStep;
  designResult: {
    products: Product[];
    aiNote: string;
    styleNotes?: string;
    generatedImageUrl?: string;
    roomAnalysis?: RoomAnalysis;
    furniturePlan?: FurniturePlan;
    generatedDesign?: GeneratedDesign;
    productRecommendations?: ProductRecommendation[];
  } | null;
  totalPrice: number;
  onAddAllToCart: () => void;
  originalImage?: string | null;
}

function MatchScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'bg-green-500/10 text-green-700' : pct >= 60 ? 'bg-yellow-500/10 text-yellow-700' : 'bg-muted text-muted-foreground';
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>{pct}% match</span>;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span>{rating.toFixed(1)}</span>
      <span>({count})</span>
    </div>
  );
}

export function DesignResults({ 
  isGenerating, 
  pipelineStep,
  designResult, 
  totalPrice, 
  onAddAllToCart,
  originalImage,
}: DesignResultsProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  if (isGenerating) {
    const activeIdx = getStepIndex(pipelineStep);
    const progress = activeIdx >= 0 ? ((activeIdx + 0.5) / PIPELINE_STEPS.length) * 100 : 5;

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/30 p-8 min-h-[400px]">
        <div className="mb-6 inline-flex animate-pulse rounded-full bg-primary/10 p-6">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <p className="font-display text-xl font-semibold mb-1">Creating your design…</p>
        <p className="text-sm text-muted-foreground mb-6">
          {PIPELINE_STEPS.find(s => s.key === pipelineStep)?.label || 'Starting…'}
        </p>

        <div className="w-full max-w-xs mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {PIPELINE_STEPS.map((step, i) => {
            const isActive = step.key === pipelineStep;
            const isDone = activeIdx > i;
            return (
              <span
                key={step.key}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground scale-105 shadow-sm'
                    : isDone
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? '✓ ' : ''}{step.label}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (designResult) {
    const recs = designResult.productRecommendations || [];
    const commissionTotal = recs.reduce((sum, r) => sum + (r.commissionPrice || r.price), 0);

    return (
      <div className="space-y-6">
        {/* Generated Room Image */}
        {designResult.generatedImageUrl && (
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2">
              <span className="text-sm font-medium">
                {showOriginal ? 'Original Room' : 'AI Generated Design'}
              </span>
              {originalImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="gap-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {showOriginal ? 'Show AI Design' : 'Show Original'}
                </Button>
              )}
            </div>
            <img
              src={showOriginal && originalImage ? originalImage : designResult.generatedImageUrl}
              alt={showOriginal ? 'Original room' : 'AI generated room design'}
              className="w-full object-cover"
            />
            {/* Placement overlay info */}
            {designResult.generatedDesign?.placementPlan && designResult.generatedDesign.placementPlan.length > 0 && !showOriginal && (
              <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                <Ruler className="inline h-3 w-3 mr-1" />
                {designResult.generatedDesign.placementPlan.length} items placed •{' '}
                {designResult.generatedDesign.compositeMethod === 'mock' ? 'Preview mode' : 'AI composited'}
              </div>
            )}
          </div>
        )}

        {/* Room Analysis Summary */}
        {designResult.roomAnalysis && (
          <div className="rounded-2xl bg-muted/30 p-4">
            <h4 className="mb-2 text-sm font-medium">Room Analysis</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Type:</span> {designResult.roomAnalysis.roomType.replace('-', ' ')}
              </div>
              <div>
                <span className="font-medium text-foreground">Lighting:</span> {designResult.roomAnalysis.lighting.slice(0, 40)}…
              </div>
              <div className="col-span-2">
                <span className="font-medium text-foreground">Detected:</span>{' '}
                {designResult.roomAnalysis.detectedFurniture.map(f => f.label).join(', ')}
              </div>
              {designResult.roomAnalysis.colorPalette && (
                <div className="col-span-2 flex items-center gap-1">
                  <span className="font-medium text-foreground">Palette:</span>
                  {designResult.roomAnalysis.colorPalette.map((color, i) => (
                    <span key={i} className="inline-block h-4 w-4 rounded-full border border-border" style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Note */}
        <div className="rounded-2xl bg-sage-light p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-full bg-sage p-1.5">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-medium">Your AI Designer Says</span>
          </div>
          <p className="text-muted-foreground">{designResult.aiNote}</p>
          {designResult.styleNotes && (
            <p className="mt-3 text-sm text-muted-foreground italic border-t border-sage/20 pt-3">
              💡 {designResult.styleNotes}
            </p>
          )}
        </div>

        {/* Furniture Plan */}
        {designResult.furniturePlan && (
          <div className="rounded-2xl border border-border p-4">
            <h4 className="mb-3 text-sm font-medium">Furniture Plan</h4>
            <div className="space-y-2">
              {designResult.furniturePlan.recommendedFurniture.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 inline-block h-2 w-2 rounded-full ${item.priority === 'must-have' ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                  <div>
                    <span className="font-medium capitalize">{item.type}</span>
                    <span className="text-muted-foreground"> — {item.placement}</span>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                </div>
              ))}
              {designResult.furniturePlan.removalSuggestions?.length > 0 && (
                <div className="mt-3 border-t border-border pt-2">
                  <p className="text-xs text-muted-foreground italic">
                    💬 {designResult.furniturePlan.removalSuggestions[0]}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Recommended Products */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recommended Products</h3>
            <span className="text-sm text-muted-foreground">
              {recs.length > 0 ? `${recs.length} items` : `${designResult.products.length} items`}
            </span>
          </div>

          {recs.length > 0 ? (
            <div className="space-y-3">
              {recs.map((rec) => (
                <Link
                  key={rec.productId}
                  to={rec.purchaseLink || `/product/${rec.productId}`}
                  className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-sm hover:shadow-md transition-shadow border border-border/50"
                >
                  <img
                    src={rec.image || '/placeholder.svg'}
                    alt={rec.name}
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm leading-tight">{rec.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {rec.furnitureType} • {rec.placement}
                        </p>
                      </div>
                      <MatchScoreBadge score={rec.matchScore} />
                    </div>
                    
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <StarRating rating={rec.rating} count={rec.reviewCount} />
                      {rec.material && rec.material !== 'Not specified' && (
                        <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                          {rec.material}
                        </span>
                      )}
                      {rec.storeSource && (
                        <span className="text-[10px] text-muted-foreground">
                          via {rec.storeSource}
                        </span>
                      )}
                    </div>

                    {rec.styleTags && rec.styleTags.length > 0 && (
                      <div className="mt-1.5 flex gap-1 flex-wrap">
                        {rec.styleTags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{rec.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm">${rec.commissionPrice?.toLocaleString() || rec.price.toLocaleString()}</p>
                    {rec.commissionPrice && rec.commissionPrice !== rec.price && (
                      <p className="text-[10px] text-muted-foreground line-through">${rec.price.toLocaleString()}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {designResult.products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="flex items-center gap-4 rounded-xl bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <img src={product.images[0]} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Total & Add to Cart */}
        <div className="rounded-2xl bg-primary/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-medium">Room Total</span>
            <span className="font-display text-2xl font-bold">
              ${(recs.length > 0 ? commissionTotal : totalPrice).toLocaleString()}
            </span>
          </div>
          {recs.length > 0 && (
            <p className="text-xs text-muted-foreground mb-3">
              Includes 5% service fee • All prices verified at time of recommendation
            </p>
          )}
          <Button size="lg" variant="hero" className="w-full gap-2" onClick={onAddAllToCart}>
            <ShoppingBag className="h-5 w-5" />
            Add Entire Room to Cart
          </Button>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Check className="mr-1 inline h-4 w-4 text-sage" />
            All items are in stock and ready to ship
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-square items-center justify-center rounded-2xl bg-muted/30">
      <div className="text-center">
        <div className="mb-4 inline-flex rounded-full bg-muted p-6">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="font-display text-xl font-semibold">Your Design Preview</p>
        <p className="mt-1 text-muted-foreground">
          Upload a photo and select your preferences to get started
        </p>
      </div>
    </div>
  );
}
