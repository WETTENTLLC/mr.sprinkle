(function (root) {
  "use strict";

  const appearance = {
    theme: "stripe",
    labels: "auto",
    inputs: "spaced",
    variables: {
      borderRadius: "4px",
      colorBackground: "#ffffff",
      colorDanger: "#df1b41",
      colorPrimary: "#0570de",
      colorSuccess: "#00c853",
      colorText: "#30313d",
      fontFamily: "default",
      fontSizeBase: "16px",
      spacingUnit: "4px"
    }
  };

  async function start(options) {
    const button = options.button;
    const status = options.status;
    const container = options.container;
    const keyMeta = document.querySelector('meta[name="stripe-publishable-key"]');
    const publishableKey = keyMeta && keyMeta.content.trim();

    if (!publishableKey || !/^pk_(test|live)_/.test(publishableKey)) {
      throw new Error("Stripe publishable key is not configured yet. Please contact Mr. Sprinkle.");
    }
    if (typeof root.Stripe !== "function") {
      throw new Error("Secure payment form could not load. Refresh the page and try again.");
    }

    button.disabled = true;
    container.hidden = false;
    container.replaceChildren();
    status.textContent = "Preparing your secure payment form…";

    try {
      const response = await fetch(options.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options.payload),
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.client_secret) {
        throw new Error(data.error || "Secure checkout could not be started.");
      }

      const stripe = root.Stripe(publishableKey);
      const checkout = stripe.initCheckoutFormSdk({
        clientSecret: data.client_secret,
        appearance
      });
      const form = checkout.createForm({ layout: "expanded" });
      form.mount(container);

      const actionsResult = await checkout.loadActions();
      if (actionsResult.type !== "success") {
        throw new Error(actionsResult.error && actionsResult.error.message
          ? actionsResult.error.message
          : "The secure payment form could not be initialized.");
      }

      form.on("confirm", async function (event) {
        status.textContent = "Confirming your payment securely…";
        try {
          await actionsResult.actions.confirm({ formConfirmEvent: event });
        } catch (error) {
          status.textContent = error && error.message
            ? error.message
            : "Payment confirmation failed. Please try again.";
        }
      });

      status.textContent = "Secure payment form ready. Complete your payment below.";
      return { checkout, form };
    } catch (error) {
      container.hidden = true;
      container.replaceChildren();
      button.disabled = false;
      status.textContent = error && error.message
        ? error.message
        : "We could not start checkout. Please contact Mr. Sprinkle.";
      throw error;
    }
  }

  root.MrSprinkleCheckoutForm = Object.freeze({ start });
})(typeof window !== "undefined" ? window : globalThis);
