const Stripe = require("stripe");
const crypto = require("node:crypto");
const stripeMode = require("../lib/stripe-mode");
const stripe = () => {
  if (!stripeMode.isSandboxSecretKey(process.env.STRIPE_SECRET_KEY)) throw new Error("Sandbox Stripe key is not configured");
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const origin = req.headers.origin;
  const allowed = (process.env.ALLOWED_ORIGINS || "https://mrsprinklereno.com,https://www.mrsprinklereno.com").split(",").map(x => x.trim());
  if (origin && !allowed.includes(origin)) return res.status(403).json({error:"Origin not allowed"});
  if (origin) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary","Origin"); }
  if (req.method === "OPTIONS") { res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS"); res.setHeader("Access-Control-Allow-Headers","Content-Type"); return res.status(204).end(); }
  if (req.method !== "POST") { res.setHeader("Allow","POST, OPTIONS"); return res.status(405).json({error:"Method not allowed"}); }
  try {
    const face = Number(req.body && req.body.faceValue);
    if (!Number.isInteger(face) || face < 100 || face > 1500 || (face - 100) % 50 !== 0) return res.status(400).json({error:"Choose $100 to $1,500 in $50 increments."});
    const email = String(req.body.email || "").trim();
    if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return res.status(400).json({error:"Enter a valid email address for gift-card delivery."});
    const ref = crypto.randomUUID();
    const pay = Math.round(face * 90);
    const session = await stripe().checkout.sessions.create({
      mode:"payment", payment_method_types:["card"],
      line_items:[{quantity:1,price_data:{currency:"usd",unit_amount:pay,product_data:{name:"Mr. Sprinkle Gift Card",description:"Gift card face value $"+face.toFixed(2)+" (10% promotional discount)"}}}],
      customer_email:email,
      client_reference_id:ref,
      metadata:{product_type:"gift_card",gift_card_reference:ref,face_value_cents:String(face*100),discount_percent:"10"},
      payment_intent_data:{metadata:{product_type:"gift_card",gift_card_reference:ref}},
      success_url:"https://mrsprinklereno.com/gift-card-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:"https://mrsprinklereno.com/gift-card.html"
    },{idempotencyKey:"gift-card-"+ref});
    return res.status(200).json({checkoutUrl:session.url});
  } catch(e) { console.error("Gift card checkout error",e.message); return res.status(503).json({error:"Gift-card checkout is not configured yet. Please contact us."}); }
};
