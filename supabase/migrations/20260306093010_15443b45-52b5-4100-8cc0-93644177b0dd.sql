
-- Add design_count to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS design_count integer NOT NULL DEFAULT 0;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan text NOT NULL DEFAULT 'free',
    billing_period text,
    status text NOT NULL DEFAULT 'active',
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own subscription (for free plan creation)
CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update subscriptions
CREATE POLICY "Admins can update all subscriptions"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can update subscriptions (for webhooks)
-- We'll handle this via service role key in edge functions

-- Create function to increment design count
CREATE OR REPLACE FUNCTION public.increment_design_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_count integer;
BEGIN
    UPDATE public.profiles 
    SET design_count = design_count + 1, updated_at = now()
    WHERE user_id = p_user_id
    RETURNING design_count INTO new_count;
    RETURN new_count;
END;
$$;
