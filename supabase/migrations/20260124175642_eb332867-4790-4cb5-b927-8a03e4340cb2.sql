-- Create products table for storing furniture items
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  original_price numeric,
  category text NOT NULL,
  subcategory text,
  images text[] NOT NULL DEFAULT '{}',
  colors text[] DEFAULT '{}',
  dimensions jsonb,
  materials text[] DEFAULT '{}',
  in_stock boolean NOT NULL DEFAULT true,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  vendor text NOT NULL,
  tags text[] DEFAULT '{}',
  commission_percent numeric NOT NULL DEFAULT 15.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access for products (anyone can view products)
CREATE POLICY "Products are publicly readable"
ON public.products
FOR SELECT
USING (true);

-- Only admins can modify products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();