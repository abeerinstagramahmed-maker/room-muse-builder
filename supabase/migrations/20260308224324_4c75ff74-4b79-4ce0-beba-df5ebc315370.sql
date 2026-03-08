
-- Add stock quantity for inventory management
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 100;

-- Add RLS policy for users to cancel their own pending/confirmed orders
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'))
WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'confirmed', 'cancelled'));
