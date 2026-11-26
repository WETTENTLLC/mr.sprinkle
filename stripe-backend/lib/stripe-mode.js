"use strict";

// Stripe live-mode secret keys may be standard secret keys (sk_live_)
// or restricted secret keys (rk_live_). Restricted keys are valid for
// server-side API access when granted the required Checkout permissions.
function isLiveSecretKey(value) {
  return typeof value === "string" &&
    (value.startsWith("sk_live_") || value.startsWith("rk_live_"));
}

function isLiveEvent(event) {
  return Boolean(event && event.livemode === true);
}

module.exports = { isLiveSecretKey, isLiveEvent };
