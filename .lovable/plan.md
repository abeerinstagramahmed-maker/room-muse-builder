

# Implementation Plan: Remaining Non-AI Improvements

After auditing the codebase, several items from the gap list are **already implemented**: mobile hamburger menu, order cancellation, catalog search/filtering, wishlist-to-cart, admin analytics, inventory tracking, and catalog refresh. Here's what actually remains:

---

## 1. Contact Form — Store Messages in Database

**New table**: `contact_messages` (name, email, message, read boolean, created_at)
- RLS: public INSERT (no auth required), admin-only SELECT
- Update `Contact.tsx` to insert into DB on submit
- Add a "Messages" section to admin dashboard or content page

## 2. Newsletter Signup — Store Subscribers

**New table**: `newsletter_subscribers` (email unique, subscribed_at)
- RLS: public INSERT, admin-only SELECT/DELETE
- Wire the Footer newsletter input with a submit handler and toast feedback
- Deduplicate on email with `ON CONFLICT DO NOTHING`

## 3. React Error Boundary

- Create `src/components/ErrorBoundary.tsx` (class component with `componentDidCatch`)
- Render a friendly "Something went wrong" UI with a "Reload" button
- Wrap `<App />` in `main.tsx`

## 4. Catalog Pagination

- Add pagination state to `Catalog.tsx` (page number, 12 items per page)
- Slice `filteredProducts` by page
- Render `Pagination` component (already exists in `ui/pagination.tsx`) below the grid
- Reset to page 1 when filters change

## 5. Breadcrumb Navigation

- Add breadcrumbs to `ProductDetail.tsx` (Home > Shop > Category > Product Name)
- Add breadcrumbs to `Checkout.tsx` (Home > Cart > Checkout)
- Use the existing `breadcrumb.tsx` UI component

## 6. Coupon/Discount Code System

**New table**: `coupons` (code unique, discount_type enum, discount_value, min_order, max_uses, used_count, active boolean, expires_at)
- RLS: public SELECT (to validate codes), admin full CRUD
- Add promo code input field to Checkout page
- Validate coupon on apply, show discount in order summary
- Decrement available uses on order creation

## 7. Dynamic Sitemap Generation

- Create an edge function `generate-sitemap` that queries all products and builds XML
- Returns proper XML content-type
- Include static routes (/catalog, /designer, /pricing, /faq, /contact) plus dynamic `/product/:id` routes

## 8. SEO Completions

- Verify and add `SEOHead` to any remaining pages missing it (FAQ, Contact, Shipping, Returns already have it — check Compare, OrderConfirmation, NotFound, OrderDetail)

---

## Database Migrations

```sql
-- contact_messages table
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
-- Public can insert, admins can read/update
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contacts" ON public.contact_messages FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.contact_messages FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  min_order numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active coupons" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Admins full access coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'));
```

## Files Modified/Created

| File | Action |
|------|--------|
| `src/components/ErrorBoundary.tsx` | Create |
| `src/main.tsx` | Wrap with ErrorBoundary |
| `src/pages/Contact.tsx` | Insert to contact_messages |
| `src/components/layout/Footer.tsx` | Wire newsletter form |
| `src/pages/Catalog.tsx` | Add pagination |
| `src/pages/ProductDetail.tsx` | Add breadcrumbs |
| `src/pages/Checkout.tsx` | Add breadcrumbs + coupon field |
| `src/hooks/useCheckout.ts` | Add coupon validation logic |
| `supabase/functions/generate-sitemap/index.ts` | Create |
| `src/pages/Compare.tsx` | Add SEOHead |
| `src/pages/OrderConfirmation.tsx` | Add SEOHead |
| `src/pages/NotFound.tsx` | Add SEOHead |
| `src/pages/OrderDetail.tsx` | Add SEOHead |

