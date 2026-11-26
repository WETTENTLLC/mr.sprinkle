"use strict";

// Production rollout: this backend now runs in live mode. Live keys and
// live Stripe events are required; test-mode keys and events are rejected.
function isLiveSecretKey(value) {
  return typeof value === "string" && value.startsWith("sk_live_");
}

function isLiveEvent(event) {
  return Boolean(event && event.livemode === true);
}

module.exports = { isLiveSecretKey, isLiveEvent };
