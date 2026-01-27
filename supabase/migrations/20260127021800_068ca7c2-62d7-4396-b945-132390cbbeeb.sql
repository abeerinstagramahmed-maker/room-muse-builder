-- Drop existing order insert policy
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

-- Create new policy that allows authenticated users to create orders for themselves
-- AND allows guest checkout (where user_id is null)
CREATE POLICY "Users can create their own orders or guest orders"
ON public.orders
FOR INSERT
WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);

-- Drop existing order_items insert policy
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;

-- Create new policy for order items that allows inserting items for orders
-- where the user owns the order OR the order has null user_id (guest order)
CREATE POLICY "Users can create order items for their own or guest orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id IS NULL OR orders.user_id = auth.uid())
  )
);

-- Allow viewing guest orders by order ID (for confirmation page)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders or guest orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() = user_id OR user_id IS NULL
);

-- Allow viewing guest order items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

CREATE POLICY "Users can view their own or guest order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);