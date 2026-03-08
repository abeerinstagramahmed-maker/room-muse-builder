
# Comprehensive Implementation Plan for Roomly

This plan addresses all the remaining features and fixes to make Roomly fully functional:
- **Header visibility on homepage**
- **Admin role assignment** 
- **Stripe payment integration**
- **Password reset flow**
- **Order email notifications**
- **Product search in catalog**

---

## 1. Fix Header Visibility on Homepage

**Issue**: The homepage (`Index.tsx`) doesn't use the `Layout` component, so the header/navigation is missing.

**Solution**: Add a floating, transparent header overlay to the AI Canvas that becomes visible when scrolling or on hover.

**Changes**:
- Modify `src/pages/Index.tsx` to include a floating header that works with the dark AI Canvas aesthetic
- Update `src/components/layout/Header.tsx` to accept a `variant` prop for transparent/canvas mode
- The header will be transparent over the canvas but gain background on scroll

---

## 2. Grant Admin Role

**Issue**: Your account (`junaid.ookay@gmail.com`) only has the `user` role.

**Solution**: Insert an admin role entry via database migration.

**Database Change**:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('85ce6696-bbd4-402c-bded-4b0642c75284', 'admin');
```

This will grant you access to `/admin` dashboard.

---

## 3. Stripe Payment Integration

**Current State**: The checkout form collects card details but doesn't process real payments. The database already has `stripe_payment_intent_id` column.

**Implementation**:

### Step 1: Request Stripe Secret Key
- Use the secret management tool to request your Stripe secret key
- This will be stored securely and only accessible in edge functions

### Step 2: Create `create-checkout-session` Edge Function
- Creates a Stripe Checkout Session with line items from the cart
- Returns the session URL for redirect
- Updates the order with `stripe_checkout_session_id`

### Step 3: Create `stripe-webhook` Edge Function  
- Handles `checkout.session.completed` event
- Updates order status to "paid"
- Stores `stripe_payment_intent_id`
- Triggers order confirmation email

### Step 4: Update Checkout Flow
- Replace manual card form with Stripe redirect
- Add "Pay with Stripe" button that creates session and redirects
- Handle return from Stripe success URL

**Files to Create/Modify**:
- `supabase/functions/create-checkout-session/index.ts` (new)
- `supabase/functions/stripe-webhook/index.ts` (new)
- `supabase/config.toml` (add new functions)
- `src/hooks/useCheckout.ts` (update to use Stripe)
- `src/pages/Checkout.tsx` (replace card form with Stripe button)

---

## 4. Password Reset Flow

**Implementation**:

### Step 1: Update Auth Page
- Add "Forgot Password?" link to sign-in form
- Create a forgot password form that accepts email
- Use Supabase's `resetPasswordForEmail` method

### Step 2: Create Reset Password Page
- New route `/reset-password`
- Handles the token from email link
- Allows setting new password with `updateUser`

### Step 3: Create Password Reset Email Edge Function (optional)
- If custom branding is needed, create a Resend-based email function
- Otherwise, use Supabase's built-in password reset emails

**Files to Create/Modify**:
- `src/pages/Auth.tsx` (add forgot password UI)
- `src/pages/ResetPassword.tsx` (new - handle password reset)
- `src/App.tsx` (add route)
- `src/hooks/useAuth.ts` (add reset methods)

---

## 5. Order Email Notifications

**Implementation**:

### Step 1: Request Resend API Key
- Prompt for Resend API key configuration
- Provide instructions for domain verification

### Step 2: Create `send-order-email` Edge Function
- Accepts order details
- Sends branded confirmation email via Resend
- Includes order summary, shipping info, and product list

### Step 3: Integrate with Checkout/Webhook
- Call the email function after successful payment
- Can be triggered from the Stripe webhook

**Files to Create**:
- `supabase/functions/send-order-email/index.ts`
- `supabase/functions/send-order-email/_templates/order-confirmation.tsx` (React Email template)

---

## 6. Product Search in Catalog

**Implementation**:

### Option A: Client-side Search (Simple)
- Add search input to catalog header
- Filter products by name/description in the frontend
- Good for current product volume

### Option B: Database Search (Scalable)
- Add full-text search index to products table
- Create search function in database
- Query with `to_tsquery`

**Recommended**: Start with client-side search for simplicity.

**Changes**:
- `src/pages/Catalog.tsx` - Add search input and filter logic
- Add search icon to header quick actions

---

## Implementation Order

For efficiency, I recommend implementing in this order:

1. **Header + Admin Role** (Quick fixes, immediate value)
2. **Password Reset** (Essential UX)
3. **Product Search** (Improves usability)
4. **Stripe Integration** (Requires API key setup)
5. **Order Emails** (Requires Resend setup)

---

## Technical Details

### Edge Function CORS Headers
All new edge functions will include:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
```

### Stripe Checkout Flow Diagram
```text
User Clicks Pay
       │
       ▼
Frontend calls create-checkout-session
       │
       ▼
Edge function creates Stripe Session
       │
       ▼
User redirected to Stripe Checkout
       │
       ▼
Payment completed → Stripe sends webhook
       │
       ▼
stripe-webhook function:
  - Updates order status
  - Triggers confirmation email
       │
       ▼
User redirected to success page
```

### Password Reset Flow
```text
User clicks "Forgot Password"
       │
       ▼
Enters email → Supabase sends reset link
       │
       ▼
User clicks link → Lands on /reset-password
       │
       ▼
Sets new password → Supabase updates
       │
       ▼
User redirected to login
```

---

## What You'll Need to Provide

1. **Stripe Secret Key** - From your Stripe Dashboard → Developers → API Keys
2. **Resend API Key** (for emails) - From resend.com dashboard
3. **Verified Domain in Resend** (for production emails)

---

## Summary

| Feature | Complexity | External Dependencies |
|---------|------------|----------------------|
| Header Fix | Low | None |
| Admin Role | Low | None |
| Password Reset | Medium | None (uses Supabase) |
| Product Search | Medium | None |
| Stripe Integration | High | Stripe Secret Key |
| Order Emails | Medium | Resend API Key |

After approval, I'll implement these features in order, starting with the quick wins (header fix + admin role) and then moving to the more complex integrations.
