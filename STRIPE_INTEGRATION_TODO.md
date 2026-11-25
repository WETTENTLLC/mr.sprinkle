# Stripe Embedded Checkout — Integration TODO

This file is the source of truth for the remaining Stripe setup and launch checks for Mr. Sprinkle.

**Current mode: sandbox only.** The backend continues to reject live secret keys and the webhook rejects live-mode events. Do not switch to live payments as part of this change.

## Values to Replace

The following public-key values are placeholders and must be replaced with the Stripe **test-mode publishable key** before the embedded forms can initialize.

**Files containing placeholders:**
- [pricing.html](pricing.html)
- [gift-card.html](gift-card.html)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| Stripe publishable key meta tag | pk_test_REPLACE_WITH_STRIPE_PUBLISHABLE_KEY | Your Stripe sandbox/test publishable key beginning with `pk_test_`. It is safe for browser use. Do not use a secret key here. |

There are no placeholder Stripe Price IDs in the Checkout Session calls. Both endpoints retain their real server-calculated `price_data` line items:
- Grill Maker: recalculates the design total from the server-side pricing catalog and estimate engine.
- Gift cards: calculates the 10% discounted amount from the validated face value.

The Checkout Session `mode` is explicitly `payment` for both one-time purchase flows. `payment_method_collection` is intentionally omitted because the configured rule applies it only to subscription sessions.

## Configured Parameters

These Checkout Studio values are already applied through the shared options helper and both existing session-creation calls.

**Files containing these parameters:**
- [stripe-backend/lib/checkout-form-options.js](stripe-backend/lib/checkout-form-options.js)
- [stripe-backend/api/create-checkout-session.js](stripe-backend/api/create-checkout-session.js)
- [stripe-backend/api/create-gift-card-checkout.js](stripe-backend/api/create-gift-card-checkout.js)

| Parameter | Value |
|-----------|-------|
| ui_mode | form |
| mode | payment |
| billing_address_collection | required |
| phone_number_collection | { enabled: false } |
| automatic_tax | { enabled: true } |
| submit_type | auto |
| shipping_address_collection.allowed_countries | Configured country list from Checkout Studio |
| saved_payment_method_options.payment_method_save | enabled |
| integration_identifier | custom_embedded_web_0001 |
| line_items | Existing server-generated line items retained; no sample Price IDs |
| payment_method_collection | Omitted for one-time payment mode |

Both endpoints now return JSON containing `client_secret`. Existing server-side pricing validation, amount calculations, metadata, client references, idempotency keys, origin checks, and sandbox-only key guard are retained. Existing hosted Checkout `success_url`/`cancel_url` parameters were replaced by each flow's `return_url` for the form UI.

## Setup and Next Steps

### 1. Stripe sandbox keys

In Stripe Dashboard, switch to Test mode (or the relevant Stripe sandbox):
- Copy the **publishable test key** and replace the two meta-tag placeholders listed above.
- Copy the **secret test key** and set it as `STRIPE_SECRET_KEY` in the Vercel backend project's Preview environment.
- Never commit secret keys or paste them into source files, GitHub issues, or chat.

The current backend guard accepts only `sk_test_` keys. Live keys are rejected.

### 2. Vercel backend environment variables

Vercel project: `mr-sprinkle-stripe-backend`  
Root directory: `stripe-backend`  
Runtime: Node.js 20+

Set the following in Vercel's encrypted environment settings (Preview first):

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe sandbox/test secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Test-mode webhook signing secret (`whsec_...`) |
| `ALLOWED_ORIGINS` | `https://mrsprinklereno.com,https://www.mrsprinklereno.com` |
| `SUPABASE_URL` | Existing Mr-Sprinkle-Orders project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key; server-side only |
| `GIFT_CARD_ENCRYPTION_KEY` | Base64-encoded 32-byte random key |
| `RESEND_API_KEY` | Resend API key for gift-card delivery |
| `GIFT_CARD_FROM_EMAIL` | Sender address verified in Resend |
| `GIFT_CARD_REDEMPTION_ADMIN_KEY` | High-entropy staff-only key for redemption endpoint |

Redeploy the backend after setting environment variables. Do not expose Supabase service-role keys, Stripe secret keys, webhook secrets, or the redemption key to browser code.

### 3. Stripe webhook

Configure a **test-mode** webhook endpoint at:

`https://mr-sprinkle-stripe-backend.vercel.app/api/webhook`

Subscribe to:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Save that endpoint's test signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel Preview. Confirm signature verification and duplicate-event retry behavior.

### 4. Stripe Tax

The Checkout Session is configured with `automatic_tax.enabled: true`. Before testing checkout, confirm Stripe Tax is activated and the business has configured the required tax registrations/locations in the Stripe Dashboard. A tax configuration issue can prevent session creation or tax calculation.

### 5. Embedded form client

The public pages load Stripe.js directly from `https://js.stripe.com/dahlia/stripe.js`; do not bundle or self-host it.

Shared client code:
- [assets/stripe-checkout-form.js](assets/stripe-checkout-form.js)

Page integrations:
- [pricing.html](pricing.html) — Grill Maker published-price designs.
- [gift-card.html](gift-card.html) — gift-card purchases.

The shared client reads the publishable key from each page's `stripe-publishable-key` meta tag, requests a Checkout Session, mounts the embedded form, loads actions, and confirms the form submission.

### 6. Test cards and sandbox checks

Use Stripe test mode only:
- Successful payment: `4242 4242 4242 4242`, any future expiry, any CVC, and any postal code.
- Declined payment: `4000 0000 0000 9995`.
- 3-D Secure challenge: `4000 0025 0000 3155`.

Test all of the following:
1. Grill Maker valid published-price design: displayed estimate and server-created amount match.
2. Grill Maker invalid configuration: rejected without creating a session.
3. Quote-only metal, enamel, custom finish, and custom artwork: payment is blocked and customer is directed to request a quote.
4. Gift card values: $100–$1,500 in $50 increments; invalid values are rejected.
5. Gift-card email validation and 10% discount calculation.
6. Required billing address and configured shipping-country selection.
7. Successful, declined, and abandoned payment flows.
8. Webhook signature rejection, duplicate delivery, gift-card issuance, encrypted code storage, issuance ledger entry, and delivery email.
9. Confirm no live-mode event or live secret is accepted.

### 7. Order fulfillment boundary

Gift-card fulfillment remains connected to the existing verified webhook flow: paid gift-card sessions are validated, codes are issued/stored, and delivery email is sent.

**Grill Maker paid-order persistence and fulfillment are not yet implemented by the existing webhook.** The checkout session retains order metadata and an order reference, but the webhook currently ignores non-gift-card Checkout sessions. Before accepting Grill Maker payments in production, implement and test durable order storage, idempotent payment-to-order matching, customer/owner notifications, and fulfillment safeguards. Do not interpret a successful Stripe payment alone as a completed production work order.

### 8. Production gate

Do not enable live payments until all of the following are complete:
- Stripe account and payout eligibility are confirmed in Stripe.
- Sandbox checkout and webhook tests pass for both flows.
- Gift-card email and balance/redemption workflows are verified.
- Grill Maker order persistence and fulfillment are implemented and tested.
- Tax settings, business registrations, and sender-domain configuration are verified.
- A separate, explicitly approved live-mode rollout is performed with live credentials stored only in Vercel.

## Project Structure

New files:
- [stripe-backend/lib/checkout-form-options.js](stripe-backend/lib/checkout-form-options.js) — shared Checkout Studio parameter set.
- [assets/stripe-checkout-form.js](assets/stripe-checkout-form.js) — shared Stripe.js Dahlia embedded-form initializer.
- [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) — this setup and launch checklist.

Updated files:
- [stripe-backend/api/create-checkout-session.js](stripe-backend/api/create-checkout-session.js)
- [stripe-backend/api/create-gift-card-checkout.js](stripe-backend/api/create-gift-card-checkout.js)
- [stripe-backend/package.json](stripe-backend/package.json)
- [stripe-backend/test/grill-estimate.test.js](stripe-backend/test/grill-estimate.test.js)
- [stripe-backend/README.md](stripe-backend/README.md)
- [stripe-backend/GIFT-CARD-SETUP.md](stripe-backend/GIFT-CARD-SETUP.md)
- [pricing.html](pricing.html)
- [gift-card.html](gift-card.html)
- [tests/grill-estimate.test.js](tests/grill-estimate.test.js)

## How the Integration Works

### Grill Maker
1. Customer selects teeth, metal, stones, cuts, and shipping in Sprinkle Studio.
2. Browser sends the selected configuration and email to the existing backend endpoint.
3. Backend independently recalculates the price and rejects invalid or quote-only designs.
4. Backend creates a one-time embedded Checkout Session with the preserved order metadata and returns `client_secret`.
5. Stripe.js mounts the embedded form; the customer enters payment and required billing/shipping details.
6. Stripe redirects to the configured return URL after confirmation. The existing webhook does not yet create a Grill Maker work order; see the fulfillment boundary above.

### Gift Cards
1. Customer selects a face value and provides the required delivery email.
2. Backend validates the amount and calculates the 10% promotional discount.
3. Backend creates a one-time embedded Checkout Session with the existing gift-card metadata and returns `client_secret`.
4. Stripe.js mounts the embedded form and confirms payment.
5. The existing webhook verifies the paid event and issues/delivers the gift card idempotently.

## Resources

- [Stripe Support](https://support.stripe.com)
- [Stripe Docs MCP](https://docs.stripe.com/mcp)
- [Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions)
- [Stripe Checkout Form](https://docs.stripe.com/payments/checkout/custom-components)
- [Stripe Testing](https://docs.stripe.com/testing)
- [Stripe API Keys](https://dashboard.stripe.com/test/apikeys)
