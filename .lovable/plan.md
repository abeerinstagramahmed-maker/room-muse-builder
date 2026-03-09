

# Roomly -- Remaining Improvements

After auditing the current state, here's what's still missing or would add significant value:

---

## 1. Invoice PDF Download (jspdf is installed but unused)
The `jspdf` and `jspdf-autotable` packages are installed but never used. Add a "Download Invoice" button to the Order Detail page that generates a branded PDF with order summary, line items, shipping address, and totals.

- Add PDF generation utility in `src/lib/generateInvoice.ts`
- Add "Download Invoice" button to `src/pages/OrderDetail.tsx`

## 2. Order Detail & Account route protection consistency
`OrderDetail.tsx` duplicates auth-guard logic inline instead of using `ProtectedRoute`. Same for `Designer.tsx` which uses `<Navigate>` inline. Wrap these routes in `ProtectedRoute` in `App.tsx` and remove the inline checks.

- Update `App.tsx` to wrap `/order/:id` and `/designer` in `ProtectedRoute`
- Remove inline auth checks from `OrderDetail.tsx` and `Designer.tsx`

## 3. Newsletter subscription (table exists, no UI wired)
The `newsletter_subscribers` table exists with RLS but the Footer likely has a non-functional newsletter form. Wire it up to actually insert into the table.

- Update `Footer.tsx` newsletter form to call `supabase.from('newsletter_subscribers').insert()`

## 4. Admin: Export orders to CSV
Admin can view orders but can't export them. Add a "Download CSV" button to the Admin Orders page for accounting/reporting.

- Add CSV export button to `src/pages/admin/AdminOrders.tsx`

## 5. Coupon application at checkout (verify wiring)
The coupons table and admin CRUD exist, but the checkout flow may not have a coupon input field. Add a coupon code input to the Checkout page that validates and applies discounts.

- Add coupon input to `src/pages/Checkout.tsx`
- Update `useCheckout.ts` to validate coupon and adjust totals

## 6. SEO: JSON-LD structured data + sitemap wiring
Product pages lack structured data for Google rich results. The sitemap edge function exists but isn't accessible.

- Add JSON-LD `Product` schema to `ProductDetail.tsx`
- Update `robots.txt` to reference the sitemap URL

---

## Recommended Order

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Coupon input at checkout | Medium | High (revenue) |
| 2 | Invoice PDF download | Low | High (user value) |
| 3 | Newsletter form wiring | Low | Medium (engagement) |
| 4 | Route protection cleanup | Low | Medium (code quality) |
| 5 | Admin CSV export | Low | Medium (operations) |
| 6 | SEO structured data | Low | Medium (growth) |

