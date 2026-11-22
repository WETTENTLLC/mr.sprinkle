(function () {
  "use strict";

  const form = document.getElementById("pressNailOrderForm");
  if (!form) return;

  const catalog = window.MrSprinklePricing;
  const metal = document.getElementById("nailMetal");
  const nailChoices = Array.from(document.querySelectorAll(".nail-choice"));
  const countOutput = document.getElementById("nailCount");
  const perNailOutput = document.getElementById("nailPerNailPrice");
  const totalOutput = document.getElementById("nailBaseEstimate");
  const estimateNote = document.getElementById("nailEstimateNote");
  const status = document.getElementById("pressNailStatus");
  const submitButton = document.getElementById("pressNailSubmit");
  const imageInput = document.getElementById("nailReferenceImage");
  const notesInput = document.getElementById("nailDesignNotes");
  const imagePreview = document.getElementById("nailReferencePreview");
  const imagePreviewImg = document.getElementById("nailReferencePreviewImage");
  const imagePreviewName = document.getElementById("nailReferencePreviewName");
  const appointmentDate = document.getElementById("nailAppointmentDate");
  const preferredTime = document.getElementById("nailPreferredTime");

  const money = (value) => new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2
  }).format(value);

  const selected = () => nailChoices.filter((input) => input.checked).map((input) => input.value);

  function selectedUnitPrice() {
    if (!catalog || !metal.value) return null;
    const selectedMetal = catalog.grillz && catalog.grillz[metal.value];
    return selectedMetal && Number.isFinite(selectedMetal.perTooth)
      ? selectedMetal.perTooth
      : null;
  }

  function syncEstimate() {
    const nails = selected();
    const count = nails.length;
    const unit = selectedUnitPrice();
    const total = unit === null ? null : unit * count;

    countOutput.textContent = String(count);
    perNailOutput.textContent = unit === null ? "Choose gold first" : money(unit) + " per nail";
    totalOutput.textContent = total === null ? "Choose gold and nails" : money(total);
    estimateNote.textContent = count === 0
      ? "Choose the fingers you want made to see your base estimate."
      : (unit === null
        ? "Choose 10K or 14K gold to calculate your base estimate."
        : "Base estimate for " + count + " custom-fit " + (count === 1 ? "nail" : "nails") +
          ". Custom artwork, stones and special finishes are reviewed separately.");

    document.getElementById("selectedNails").value = nails.join(", ");
    document.getElementById("nailCountHidden").value = String(count);
    document.getElementById("nailMetalName").value = metal.selectedOptions[0]?.textContent || "";
    document.getElementById("nailPerUnitHidden").value = unit === null ? "" : money(unit);
    document.getElementById("nailBaseEstimateHidden").value = total === null ? "" : money(total);
    document.getElementById("nailEstimateStatus").value = unit === null || count === 0
      ? "incomplete"
      : "base_estimate_pending_final_fit_and_custom_quote";
    document.getElementById("nailPricingVersion").value = catalog ? catalog.version : "";
  }

  document.getElementById("selectAllNails").addEventListener("click", function () {
    nailChoices.forEach((input) => { input.checked = true; });
    syncEstimate();
  });

  document.getElementById("clearNails").addEventListener("click", function () {
    nailChoices.forEach((input) => { input.checked = false; });
    syncEstimate();
  });

  nailChoices.forEach((input) => input.addEventListener("change", syncEstimate));
  metal.addEventListener("change", syncEstimate);

  // Keep the preferred appointment request in Reno local time.
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  appointmentDate.min = today.toISOString().slice(0, 10);
  preferredTime.min = "10:00";
  preferredTime.max = "17:30";
  preferredTime.step = "1800";

  let previewUrl = "";
  imageInput.addEventListener("change", function () {
    const file = imageInput.files && imageInput.files[0];
    if (!file) {
      imagePreview.hidden = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      imageInput.value = "";
      status.textContent = "Please choose an image file.";
      status.className = "press-nail-status is-error";
      imagePreview.hidden = true;
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      imageInput.value = "";
      status.textContent = "Please choose an image smaller than 25 MB.";
      status.className = "press-nail-status is-error";
      imagePreview.hidden = true;
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    imagePreviewImg.src = previewUrl;
    imagePreviewName.textContent = file.name;
    imagePreview.hidden = false;
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    syncEstimate();

    const nails = selected();
    const unit = selectedUnitPrice();
    const file = imageInput.files && imageInput.files[0] ? imageInput.files[0] : null;
    const notes = notesInput.value.trim();

    if (!catalog || !metal.value || unit === null) {
      status.textContent = "Please choose 10K or 14K gold.";
      status.className = "press-nail-status is-error";
      metal.focus();
      return;
    }
    if (!nails.length) {
      status.textContent = "Please select at least one nail for an individual impression.";
      status.className = "press-nail-status is-error";
      document.getElementById("nailSelectionHeading").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (file && !notes) {
      status.textContent = "Please add a short description of the reference image so we know what to review.";
      status.className = "press-nail-status is-error";
      notesInput.focus();
      return;
    }
    if (file && file.size > 25 * 1024 * 1024) {
      status.textContent = "Please choose an image smaller than 25 MB.";
      status.className = "press-nail-status is-error";
      return;
    }
    if (!appointmentDate.value || !preferredTime.value) {
      status.textContent = "Please choose a preferred appointment date and time.";
      status.className = "press-nail-status is-error";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending your request…";
    status.textContent = "Sending your custom nail fitting request securely…";
    status.className = "press-nail-status";

    const data = new FormData(form);
    if (file) data.set("referenceImage", file);

    const orderReference = "NAIL-" + new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const submittedAt = new Date().toISOString();
    const payload = {
      order_reference: orderReference,
      submitted_at: submittedAt,
      notification_email: "wettentertainmentllc@gmail.com",
      form_type: "press_on_nails_order_request",
      booking_flow: "custom_nail_impression",
      submitted_at: new Date().toISOString(),
      customer_name: data.get("customerName"),
      email: data.get("email"),
      phone: data.get("phone"),
      service_type: "custom_gold_press_on_nails",
      appointment_mode: "in_person_at_envy_kutz_reno",
      preferred_appointment_date: data.get("appointmentDate"),
      preferred_appointment_time: data.get("preferredTime"),
      selected_nails: nails,
      nail_count: nails.length,
      material: metal.selectedOptions[0]?.textContent || "",
      per_nail_base_price: money(unit),
      base_estimate: money(unit * nails.length),
      design_notes: notes,
      reference_image_filename: file ? file.name : "",
      custom_details_quote_required: Boolean(file || notes),
      order_status: "appointment_and_final_quote_required",
      payment_status: "not_collected_secure_payment_link_after_quote_approval"
    };

    data.set("orderReference", orderReference);
    data.set("submittedAt", submittedAt);
    data.set("notificationEmail", payload.notification_email);
    data.set("orderDetails", JSON.stringify(payload, null, 2));
    data.set("_subject", "NEW CUSTOM GOLD PRESS-ON NAIL REQUEST — " + orderReference);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });
      let result = {};
      try { result = await response.json(); } catch (_) {}
      if (!response.ok || result.errors) {
        const detail = result.errors ? result.errors.map((item) => item.message).join("; ") : "HTTP " + response.status;
        throw new Error("The request could not be confirmed as delivered (" + detail + ").");
      }

      window.location.href = "thank-you.html?service=press-on-nails&ref=" + encodeURIComponent(orderReference);
    } catch (error) {
      status.textContent = error.message || "We could not send your request. Please try again or text (530) 214-0676.";
      status.className = "press-nail-status is-error";
      submitButton.disabled = false;
      submitButton.textContent = "Request My Nail Impression Appointment";
    }
  });

  syncEstimate();
})();
