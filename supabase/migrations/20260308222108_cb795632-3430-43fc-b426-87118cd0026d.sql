
-- Add fulfillment fields to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purchase_link text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_source text;

-- Add fulfillment fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';

-- Add admin policy for viewing all order items (for fulfillment dashboard)
CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policy for updating order items
CREATE POLICY "Admins can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
