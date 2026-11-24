const Stripe = require("stripe");
const crypto = require("node:crypto");

const stripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const allowedOrigins = () => new Set(
  (process.env.ALLOWED_ORIGINS || "https://mrsprinklereno.com,https://www.mrsprinklereno.com")
    .split(",").map((v) => v.trim()).filter(Boolean)
);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins().has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  return !origin || allowedOrigins().has(origin);
}

module.exports = async function handler(req, res) {
  if (!setCors(req, res)) return res.status(403).json({ error: "Origin not allowed" });
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const priceId = typeof body.priceId === "string" ? body.priceId.trim() : "";
    const allowedPriceIds = new Set(
      (process.env.STRIPE_ALLOWED_PRICE_IDS || "").split(",").map((v) => v.trim()).filter(Boolean)
    );

    if (!priceId || !allowedPriceIds.has(priceId)) {
      return res.status(400).json({ error: "This payment option is not currently available." });
    }

    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const orderReference = crypto.randomUUID();
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      client_reference_id: orderReference,
      metadata: { order_reference: orderReference, source: "mrsprinklereno.com" },
      payment_intent_data: {
        metadata: { order_reference: orderReference, source: "mrsprinklereno.com" }
      },
      success_url: "https://mrsprinklereno.com/payment-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://mrsprinklereno.com/payment-cancelled.html"
    }, { idempotencyKey: orderReference });

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ checkoutUrl: session.url, orderReference });
  } catch (error) {
    console.error("Stripe Checkout session creation failed:", error.message);
    return res.status(500).json({ error: "We could not start checkout. Please contact Mr. Sprinkle." });
  }
};
