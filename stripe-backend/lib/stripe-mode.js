"use strict";

// Production rollout: this backend now runs in live mode. Live keys and
// live Stripe events are required; test-mode keys and events are rejected.
// Both standard secret keys (sk_live_) and restricted keys (rk_live_) are
// accepted. Stripe's dashboard now creates restricted keys by default, and a
// restricted key with Checkout access is sufficient for this backend
// (checkout session creation; webhook verification is local). A restricted
// key is also safer: it cannot move money out of the account.
function isLiveSecretKey(value) {
  return typeof value === "string" && (value.startsWith("sk_live_") || value.startsWith("rk_live_"));
}

function isLiveEvent(event) {
  return Boolean(event && event.livemode === true);
}

module.exports = { isLiveSecretKey, isLiveEvent };
