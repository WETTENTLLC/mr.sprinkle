"use strict";

// This isolated backend is intentionally sandbox-only until a separate,
// explicitly approved production rollout is completed.
function isSandboxSecretKey(value) {
  return typeof value === "string" && value.startsWith("sk_test_");
}

function isSandboxEvent(event) {
  return Boolean(event && event.livemode === false);
}

module.exports = { isSandboxSecretKey, isSandboxEvent };
