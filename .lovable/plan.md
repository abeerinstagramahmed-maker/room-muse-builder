

# Remaining Gaps and Improvements for Roomly

After a fresh audit of what's already implemented vs. what's missing, here's what would be most beneficial:

---

## Already Done (no action needed)
- Legal pages (Privacy, Terms, Cookies, About) -- done
- ProtectedRoute component -- done
- Google OAuth sign-in -- done
- Admin coupon CRUD -- done
- Coupon application at checkout -- done
- Stock decrement trigger -- done
- Order status email triggers from admin -- done
- PWA manifest + service worker -- done

---

## What's Still Missing

### 1. Real-time order status updates on Account page
The Account page currently loads orders once. Adding a realtime subscription on the `orders` table would let users see status changes (shipped, delivered) live without refreshing.

- Enable realtime on `orders` table via migration
- Subscribe to `postgres_changes` in `useOrders.ts`
- Invalidate/update the orders query on change

### 2. Product image zoom / lightbox on Product Detail
Product images are static thumbnails. Adding a click-to-zoom or hover-magnify experience is standard for e-commerce.

- Add a lightbox dialog in `ProductDetail.tsx` that opens on image click
- Show full-resolution image with zoom-on-hover or pinch-to-zoom on mobile

### 3. Admin route protection
Admin routes (`/admin/*`) are completely unprotected -- anyone can navigate to them. They should require authentication and admin role verification.

- Create an `AdminProtectedRoute` component that checks `has_role(uid, 'admin')`
- Wrap all `/admin/*` routes

### 4. Checkout route protection
The checkout page doesn't require login. Users can fill out forms as guests, but orders are tied to `user_id`. This should either require auth or properly support guest checkout.

- Wrap `/checkout` in `ProtectedRoute` to require login before purchasing

### 5. Cart persistence across sessions
The cart currently uses React context (in-memory). When users refresh or return later, the cart is empty. Persisting to localStorage or the database would improve UX.

- Add localStorage sync to `CartContext` so cart survives page refreshes

### 6. SEO: Sitemap and structured data
A `generate-sitemap` edge function exists but there's no link to it or scheduled trigger. Product pages lack JSON-LD structured data for Google rich results.

- Add JSON-LD product schema to `ProductDetail.tsx`
- Wire the sitemap function to be accessible at `/sitemap.xml`

---

## Recommended Priority

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Admin route protection | Low | Critical (security) |
| 2 | Cart persistence (localStorage) | Low | High (UX) |
| 3 | Checkout route protection | Low | High (data integrity) |
| 4 | Real-time order updates | Low | Medium |
| 5 | Product image lightbox | Medium | Medium |
| 6 | SEO structured data + sitemap | Medium | Medium (growth) |

I recommend tackling items 1-3 first as they are quick wins with significant security and UX impact.

