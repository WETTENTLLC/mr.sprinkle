const Stripe = require("stripe");
const stripeMode = require("../lib/stripe-mode");

module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  if (!stripeMode.isSandboxSecretKey(process.env.STRIPE_SECRET_KEY) || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send("Sandbox webhook is not configured");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) return res.status(400).send("Missing Stripe signature");

  let event;
  try {
    const rawBody = await readRawBody(req);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.warn("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send("Invalid webhook signature");
  }

  // Reject live-mode events even if a webhook secret was misconfigured.
  if (!stripeMode.isSandboxEvent(event)) {
    console.error("Rejected non-sandbox Stripe webhook event:", event.id);
    return res.status(400).send("Only sandbox Stripe events are accepted");
  }

  // Deliberately do not mark orders paid or fulfill products here yet.
  // Connect this verified event to durable order storage before enabling fulfillment.
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      console.info("Verified sandbox Stripe event:", event.type, event.id);
      break;
    default:
      console.info("Verified sandbox Stripe event ignored:", event.type);
  }

  return res.status(200).json({ received: true });
};
