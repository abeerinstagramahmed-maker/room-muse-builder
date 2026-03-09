
-- Function to decrement stock quantity when order items are inserted
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
        in_stock = CASE WHEN stock_quantity - NEW.quantity > 0 THEN true ELSE false END
    WHERE id::text = NEW.product_id;
    RETURN NEW;
END;
$$;

-- Trigger on order_items insert
CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrement_stock_on_order();
