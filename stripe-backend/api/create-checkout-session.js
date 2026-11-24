const Stripe = require("stripe");
const crypto = require("node:crypto");
const estimateEngine = require("../lib/grill-estimate");

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
    const config = body.configuration && typeof body.configuration === "object"
      ? body.configuration
      : null;
    if (!config) return res.status(400).json({ error: "A Grill Maker configuration is required." });

    // Recalculate on the server using the same versioned catalog and estimate
    // engine as the public website. Never accept a browser-supplied amount.
    const estimate = estimateEngine.calculate(config);
    if (!estimate.ok) return res.status(400).json({ error: estimate.error || "The configuration is invalid." });
    if (estimate.status !== "estimate" || !Number.isFinite(estimate.total)) {
      return res.status(422).json({
        error: "This design needs a custom quote before payment.",
        quoteRequired: true,
        quoteReasons: estimate.quoteReasons,
        knownSubtotal: estimate.knownSubtotal,
        pricingVersion: estimate.version
      });
    }

    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const amount = Math.round(estimate.total * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) {
      return res.status(400).json({ error: "The calculated order total is invalid." });
    }

    const orderReference = crypto.randomUUID();
    const description = estimateEngine.summaryText(estimate).slice(0, 4500);
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: "Mr. Sprinkle custom grillz order",
            description
          }
        }
      }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      client_reference_id: orderReference,
      metadata: {
        order_reference: orderReference,
        source: "mrsprinklereno.com",
        pricing_version: estimate.version,
        estimate_total_cents: String(amount)
      },
      payment_intent_data: {
        metadata: {
          order_reference: orderReference,
          pricing_version: estimate.version
        }
      },
      success_url: "https://mrsprinklereno.com/payment-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://mrsprinklereno.com/payment-cancelled.html"
    }, { idempotencyKey: orderReference });

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      checkoutUrl: session.url,
      orderReference,
      amount: estimate.total,
      currency: "usd",
      pricingVersion: estimate.version,
      summary: description
    });
  } catch (error) {
    console.error("Stripe Checkout session creation failed:", error.message);
    return res.status(500).json({ error: "We could not start checkout. Please contact Mr. Sprinkle." });
  }
};
