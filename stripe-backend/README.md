# Mr. Sprinkle Stripe backend (sandbox first)

This folder is a separate Vercel Node.js service. The customer website remains on GitHub Pages.

## Pricing source of truth

The backend contains server-side copies of the website's current pricing files:

- `lib/pricing-catalog.js` mirrors `assets/pricing-catalog.js`
- `lib/grill-estimate.js` mirrors `assets/grill-estimate.js`

The checkout endpoint recalculates the submitted Grill Maker configuration on the server. It does not accept a client-provided amount or Stripe Price ID. The catalog version is included in Checkout metadata so the order can be traced to the pricing revision used.

The existing published catalog currently includes silver ($100/tooth), 10K gold ($240/tooth), 14K gold ($300/tooth), and 14K dental gold ($320/tooth); published stone prices, pair-based and per-arch custom cuts, fang extensions, standard shipping ($60), and rush delivery ($150). Mold kits ($40), WETT Shades ($65), and ATM clips ($10 standard / $15 custom) are separate catalog products and need their own checkout selection workflow. Quote-only materials and services remain quote-only.

If the estimate engine returns a quote-required result (for example, quote-only metal, custom finish, enamel, or custom artwork), Checkout is blocked and the customer must request a quote.

## API

`POST /api/create-checkout-session`

Request body:
```json
{
  "configuration": {
    "design": "grillz",
    "metal": "silver",
    "upperCount": 6,
    "lowerCount": 0,
    "shipping": "standard",
    "stones": "none",
    "stoneCount": 0
  },
  "customerEmail": "customer@example.com"
}
```

The server recalculates the total with the website's estimate engine and creates a hosted Stripe Checkout Session for that amount. The request must never be trusted to provide a price.

`POST /api/webhook` verifies Stripe signatures against the raw request body. It currently acknowledges verified events only; it does not yet persist orders or trigger fulfillment.

## Vercel settings

Project: `mr-sprinkle-stripe-backend`; root directory: `stripe-backend`; Node.js 20+.

Set these environment variables in Vercel Preview settings only for the initial sandbox:

- `STRIPE_SECRET_KEY`: sandbox secret key, stored only in Vercel
- `STRIPE_WEBHOOK_SECRET`: signing secret from Stripe CLI or the sandbox webhook endpoint
- `ALLOWED_ORIGINS`: `https://mrsprinklereno.com,https://www.mrsprinklereno.com`

No Stripe secrets belong in GitHub or browser code.

## Sandbox test plan

1. Add the sandbox secret key in Vercel Preview environment settings.
2. Configure Stripe CLI forwarding to the deployed webhook URL and save its signing secret in Vercel.
3. Test a valid published-price configuration and compare the Checkout amount with the website estimate.
4. Test invalid configurations and quote-only configurations; they must not create a Checkout Session.
5. Use Stripe test card `4242 4242 4242 4242` with any future expiry, CVC, and postal code.
6. Test declined card `4000 0000 0000 9995`, cancelled Checkout, and webhook signature rejection.
7. Verify successful and failed event delivery in Stripe.

## Production gate

Before enabling customer payments, implement durable order storage, idempotent webhook-to-order matching, and fulfillment safeguards. Add customer-facing checkout handoff only after the complete sandbox flow passes. Do not add live keys, switch to live mode, or enable production payments until Stripe account verification and payout setup are complete.
