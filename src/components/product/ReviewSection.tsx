import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReviewSectionProps {
  productId: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => onRate?.(star)}
        className={cn("transition-colors", interactive && "cursor-pointer hover:text-ai-amber")}
      >
        <Star className={cn("h-5 w-5", star <= rating ? "fill-ai-amber text-ai-amber" : "text-muted-foreground/30")} />
      </button>
    ))}
  </div>
);

export const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { reviews, loading, addReview, averageRating, userReview } = useReviews(productId);
  const { isAuthenticated } = useAuthContext();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    await addReview(rating, title, body);
    setShowForm(false);
    setRating(0); setTitle(''); setBody('');
  };

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        {isAuthenticated && !userReview && !showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {showForm && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Your Rating</p>
                <StarRating rating={rating} onRate={setRating} interactive />
              </div>
              <Input placeholder="Review title" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea placeholder="Share your experience..." rows={4} value={body} onChange={e => setBody(e.target.value)} />
              <div className="flex gap-2">
                <Button type="submit" disabled={rating === 0}>Submit Review</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Verified Buyer</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.title && <h4 className="mt-3 font-medium">{review.title}</h4>}
                {review.body && <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};
