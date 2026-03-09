

# Roomly -- Gaps and Improvement Opportunities

After auditing the full codebase, here are the missing pieces and high-value additions grouped by priority:

---

## Priority 1 -- Quick Wins (Low effort, high impact)

### 1. Privacy Policy, Terms of Service, and Cookie Policy pages
The footer links to `#` for Privacy, Terms, and Cookies. These need real pages -- important for legal compliance especially with Stripe payments.

- Create `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`, `src/pages/Cookies.tsx`
- Add routes in `App.tsx`
- Update footer links

### 2. Footer "Company" links are dead
About Us, Careers, Press, Blog all link to `#`. At minimum, create an About page.

- Create `src/pages/About.tsx` with company story, mission, team
- Update footer links (remove or grey out Careers/Press/Blog if not needed)

### 3. Protected route wrapper component
Currently, each page (Account, Designer, Checkout) duplicates auth-guard logic inline. A `<ProtectedRoute>` component would clean this up and prevent missed guards.

- Create `src/components/ProtectedRoute.tsx`
- Wrap authenticated routes in `App.tsx`

---

## Priority 2 -- User Experience Improvements

### 4. Order status email notifications (shipped, delivered)
The current email setup only covers order confirmation. Admin should be able to trigger "shipped" and "delivered" emails when updating order status.

- Update `AdminOrders.tsx` to call `send-order-email` with `type: 'order_shipped'` / `'order_delivered'` when status changes
- Update the edge function to handle these templates

### 5. Stock quantity management
Products have `stock_quantity` but there's no decrement on purchase. Orders could oversell.

- Add stock decrement logic in checkout (or via database trigger on order_items insert)
- Show "Low stock" or "Out of stock" badges on product cards

### 6. Coupon management in admin
The `coupons` table exists with full RLS but there's no admin UI to create/edit/delete coupons.

- Add an Admin Coupons page (`/admin/coupons`) with CRUD interface
- Add link in AdminSidebar

### 7. Toast/notification for real-time order updates
Use the realtime subscription on `orders` table so users see live status changes on their Account page without refreshing.

---

## Priority 3 -- Growth and Engagement

### 8. Social login (Google OAuth)
Only email/password auth exists. Adding Google sign-in reduces friction significantly.

- Configure Google OAuth provider in auth settings
- Add "Sign in with Google" button to Auth page

### 9. Product image zoom on hover / lightbox
Product detail pages show images but lack zoom or fullscreen lightbox -- standard for e-commerce.

### 10. PWA improvements
`vite-plugin-pwa` is installed but there's no service worker config or manifest in `vite.config.ts`. Making the app installable would benefit mobile users.

### 11. Analytics / conversion tracking
No analytics integration exists. Adding basic event tracking (page views, add-to-cart, checkout started, purchase) would provide business insights.

---

## Recommended Implementation Order

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Privacy/Terms/Cookies pages | Low | High (legal) |
| 2 | About page + fix dead footer links | Low | Medium |
| 3 | ProtectedRoute component | Low | Medium (code quality) |
| 4 | Admin coupon management UI | Medium | High |
| 5 | Stock decrement on purchase | Medium | High (prevents oversell) |
| 6 | Order status emails (shipped/delivered) | Medium | High |
| 7 | Google OAuth | Medium | High (conversion) |
| 8 | Product image zoom/lightbox | Low | Medium |
| 9 | PWA manifest + service worker | Low | Medium |
| 10 | Real-time order status updates | Low | Medium |

I recommend starting with items 1-3 (quick wins) and then tackling 4-6 (core e-commerce gaps). Let me know which ones you'd like to implement.

