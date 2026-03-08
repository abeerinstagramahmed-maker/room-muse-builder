

# Roomly - What's Missing & Recommendations

After reviewing the entire codebase, here's what's currently built vs. what's missing or could be improved:

## What's Already Working
- Landing page with sections (hero, problem, how-it-works, features, before/after, pricing, testimonials, CTA)
- Auth (sign in, sign up, forgot password, reset password)
- Product catalog with search and filters
- AI room designer with freemium gating (1 free design, then Pro)
- Cart, checkout, and order confirmation
- Profile page (avatar, name, password change)
- Account page (saved designs, order history)
- Admin dashboard (users, products, orders, content, settings)
- Stripe checkout and webhook edge functions
- Subscription checkout edge function
- Product sourcing edge functions (Amazon API, Firecrawl scraping)

---

## What's Missing / Recommended Additions

### 1. Order Email Notifications
No email is sent when a user places an order or when payment succeeds. Users have no confirmation outside the app. This requires a Resend API key and an edge function to send branded order confirmation emails triggered from the Stripe webhook.

### 2. Google / Social Login
Currently only email+password auth exists. Adding Google OAuth would reduce friction significantly and increase sign-up conversion. This is a configuration change plus a small UI update to the Auth page.

### 3. Wishlist / Favorites
Users can save full designs but can't favorite individual products. A simple `wishlists` table and heart icon on product cards would improve engagement and return visits.

### 4. Product Reviews
The `products` table has `rating` and `review_count` columns but there's no `reviews` table or UI for users to leave reviews. Adding user reviews builds trust and provides social proof.

### 5. FAQ / Help Center Page
Footer links to FAQ, Contact, Shipping, and Returns all point to `#`. Creating at least a basic FAQ page and a contact form would make the app feel complete and professional.

### 6. SEO & Meta Tags
No page has dynamic `<title>` or `<meta>` tags. Adding `react-helmet-async` for per-page SEO (especially product detail pages and the landing page) would improve discoverability.

### 7. Loading / Empty States Polish
Some pages could benefit from better skeleton loaders, empty state illustrations, and error boundaries to handle edge cases gracefully.

### 8. Mobile Navigation Improvements
The header has a mobile menu but the admin dashboard sidebar may not be fully responsive. Worth auditing the admin panel on mobile.

### 9. Analytics Dashboard Enhancement
The admin dashboard shows basic stats cards but no charts or trends over time. Adding order volume, revenue, and user growth charts using Recharts (already installed) would give admins real insights.

### 10. Dark Mode Support
`next-themes` is already installed but dark mode doesn't appear to be wired up with a toggle. Adding a theme switcher in the header would be a quick win.

---

## Priority Recommendation

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Order email notifications | Medium | High - users expect confirmation emails |
| 2 | FAQ + Contact page | Low | Medium - completes the professional feel |
| 3 | Google OAuth login | Low | High - reduces sign-up friction |
| 4 | Wishlist/Favorites | Medium | Medium - improves engagement |
| 5 | Admin analytics charts | Medium | Medium - better business insights |
| 6 | SEO meta tags | Low | Medium - better discoverability |
| 7 | Product reviews | Medium | Medium - builds trust |
| 8 | Dark mode toggle | Low | Low - nice-to-have polish |

