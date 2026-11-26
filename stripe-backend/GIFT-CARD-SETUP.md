# Gift Card Stripe Checkout (Sandbox)

This branch adds a dedicated Stripe Checkout endpoint and webhook fulfillment for gift cards.

## Required Vercel environment variables (backend project)
- `STRIPE_SECRET_KEY`: Stripe test secret key (`sk_test_...`) only; live keys are rejected by the current sandbox guard.
- `STRIPE_WEBHOOK_SECRET`: signing secret for the Stripe webhook endpoint `/api/webhook`.
- `SUPABASE_URL`: URL for the existing Mr-Sprinkle-Orders project.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase server-only service role key. Never expose in browser code.
- `GIFT_CARD_ENCRYPTION_KEY`: base64-encoded 32-byte random key used to encrypt deliverable codes at rest.
- `GMAIL_USER`: Gmail address gift cards are sent from (mrsprinklereno@gmail.com).
- `GMAIL_APP_PASSWORD`: Gmail app password for that account (16 characters, generated in the Google account with 2-step verification on — never the account password).
- `GIFT_CARD_FROM_EMAIL`: sender address shown on gift-card emails — use the same Gmail address as `GMAIL_USER` (required).
- `GIFT_CARD_REDEMPTION_ADMIN_KEY`: high-entropy secret for staff-only redemption calls (required before redemption use).

Set variables only in Vercel's encrypted environment settings. Do not commit secrets.

## Stripe setup
Create a test-mode webhook at `https://<backend-domain>/api/webhook` for:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

The checkout endpoint is `/api/create-gift-card-checkout`. The public gift-card page must be deployed with the backend URL in its fetch call. This branch currently targets sandbox Stripe only.

## Before customer launch
- Configure all environment variables and redeploy the backend.
- Configure and verify the webhook in Stripe test mode.
- Run a test purchase and confirm a gift-card record, issuance transaction, and delivery email.
- Test duplicate webhook delivery and balance/redemption flows.
- The private `/api/gift-card-balance` endpoint supports balance checks by code.\n- The `/api/redeem-gift-card` endpoint requires a server-side `GIFT_CARD_REDEMPTION_ADMIN_KEY`; only authorized staff systems should call it.\n- Integrate the authorized redemption endpoint into the order checkout/admin workflow before accepting gift cards as tender.
- Only then separately review live-mode readiness and Stripe account eligibility.
