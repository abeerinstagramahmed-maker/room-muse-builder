-- 1. Fix EXPOSED_SENSITIVE_DATA: stop exposing guest orders to everyone.
DROP POLICY IF EXISTS "Users can view their own orders or guest orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix order tampering: restrict guest INSERT exposure to authenticated owners or true guest inserts only (unchanged behavior but kept explicit).
-- 3. Prevent customers from modifying sensitive financial fields on their own orders.
CREATE OR REPLACE FUNCTION public.prevent_order_field_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins (and service role, which bypasses RLS) can change anything.
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admin users may only change the status of their own orders.
  -- Block changes to any financial / payment / fulfillment fields.
  IF NEW.subtotal IS DISTINCT FROM OLD.subtotal
     OR NEW.tax IS DISTINCT FROM OLD.tax
     OR NEW.shipping IS DISTINCT FROM OLD.shipping
     OR NEW.total IS DISTINCT FROM OLD.total
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.stripe_checkout_session_id IS DISTINCT FROM OLD.stripe_checkout_session_id
     OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
     OR NEW.tracking_number IS DISTINCT FROM OLD.tracking_number
     OR NEW.estimated_delivery IS DISTINCT FROM OLD.estimated_delivery
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.contact_email IS DISTINCT FROM OLD.contact_email
     OR NEW.contact_phone IS DISTINCT FROM OLD.contact_phone
     OR NEW.shipping_address IS DISTINCT FROM OLD.shipping_address THEN
    RAISE EXCEPTION 'You are not allowed to modify these order fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_order_field_tampering_trigger ON public.orders;
CREATE TRIGGER prevent_order_field_tampering_trigger
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_order_field_tampering();