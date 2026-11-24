# Mr. Sprinkle Stripe backend (sandbox first)

This folder is a separate Vercel Node.js service. The existing customer website remains on GitHub Pages. Do not move the website or expose Stripe secrets in browser code.

## Current behavior

- `POST /api/create-checkout-session` creates a Stripe-hosted Checkout Session for one server-approved Stripe Price ID.
- The browser cannot submit an amount, currency, product description, or redirect URL.
- `POST /api/webhook` verifies Stripe signatures against the raw request body.
- The webhook currently acknowledges verified events only. It does **not** update an order database, send fulfillment instructions, or declare an order paid in the website. Durable order storage and idempotent fulfillment must be added before production use.

## Vercel project settings

Create a Vercel project connected to `WETTENTLLC/mr.sprinkle` with Root Directory set to `stripe-backend`, Framework Preset `Other`, and Node.js 20 or newer. Deploy previews first.

Set these environment variables in the Vercel project settings (Preview environment initially):

- `STRIPE_SECRET_KEY`: sandbox secret key, stored only in Vercel
- `STRIPE_WEBHOOK_SECRET`: signing secret from the Stripe CLI or sandbox webhook endpoint
- `STRIPE_ALLOWED_PRICE_IDS`: comma-separated sandbox Price IDs approved by the business
- `ALLOWED_ORIGINS`: `https://mrsprinklereno.com,https://www.mrsprinklereno.com`

Never commit a secret key or webhook signing secret. Never use a live key for this setup.

## Test flow

1. Create sandbox Products and Prices in Stripe for each payment option the business has approved.
2. Add only those sandbox Price IDs to `STRIPE_ALLOWED_PRICE_IDS`.
3. Configure the sandbox secret key in Vercel Preview environment.
4. Deploy a Preview and verify that missing/invalid Price IDs are rejected.
5. Start Stripe CLI forwarding to the deployed webhook URL and set the returned signing secret in the Preview environment.
6. Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC, and any postal code.
7. Confirm Checkout success and inspect the verified webhook events in Stripe. Also test declined card `4000 0000 0000 9995`.
8. Do not fulfill an order until a durable order record and verified webhook-to-order matching are implemented.

## Website integration

The existing booking form and Grill Maker handoff are intentionally unchanged in this first backend milestone. After payment options and prices are approved, the website can call the backend for those specific fixed-price items. Custom grillz should continue through quote review; the team should issue a payment link or approve an amount before collecting payment.

## Production gate

Do not add live Stripe keys, switch to live mode, enable fulfillment, or publish payment buttons until sandbox tests pass, order persistence and idempotency are implemented, webhook handling is tested, and the business has completed Stripe account verification and payout setup.
