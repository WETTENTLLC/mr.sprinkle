// Corporate-level static regression checks for customer inquiries, orders and payment boundaries.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

test("homepage quote and appointment inquiries reach the business intake", () => {
  const html = read("index.html");
  const start = html.indexOf("// Lead Form Handler");
  const end = html.indexOf("// Scroll to form function", start);
  assert.ok(start >= 0 && end > start, "homepage lead handler exists");
  const handler = html.slice(start, end);

  assert.match(html, /<form id="leadForm"[^>]*action="https:\/\/formspree\.io\/f\/myzpanyg"[^>]*method="POST"/);
  assert.match(html, /id="leadFormStatus"[^>]*role="status"/);
  assert.match(html, /name="_gotcha"/);
  assert.match(handler, /fetch\('https:\/\/formspree\.io\/f\/myzpanyg'/);
  assert.match(handler, /if \(!response\.ok\)/);
  assert.match(handler, /leadEmail\.required = emailRequired/);
  assert.match(handler, /leadForm\.reset\(\)/);
  assert.match(handler, /Your inquiry has been submitted/);
  assert.doesNotMatch(handler, /window\.open.*(?:mailto:|sms:)/);
});

test("gift card page collects an order request without taking unfulfilled payment", () => {
  const html = read("gift-card.html");
  assert.match(html, /id="giftCardRequestForm"/);
  assert.match(html, /action="https:\/\/formspree\.io\/f\/myzpanyg"/);
  assert.match(html, /name="faceValue"/);
  assert.match(html, /name="senderName"/);
  assert.match(html, /name="senderEmail"/);
  assert.match(html, /name="recipientName"/);
  assert.match(html, /name="recipientEmail"/);
  assert.match(html, /gift card value from \$100 to \$1,500 in \$50 increments/);
  assert.match(html, /fetch\('https:\/\/formspree\.io\/f\/myzpanyg'/);
  assert.match(html, /thank-you\.html\?service=gift-card/);
  assert.match(html, /No card details are collected here/);
  assert.match(html, /payment has been verified/);
  assert.doesNotMatch(html, /paypal\.com/);
  assert.doesNotMatch(html, /generateGiftCardCode|previewCode|discount=0\.10|You Pay:/);
});

test("gift card confirmation does not claim a payment or code was issued", () => {
  const html = read("thank-you.html");
  assert.match(html, /giftCardRequestConfirmation/);
  assert.match(html, /No payment has been collected and no gift card code has been issued yet/);
  assert.match(html, /service'\) === 'gift-card'/);
});

test("Grill Maker booking carries its existing design and uploads into the appointment request", () => {
  const page = read("pricing.html");
  const form = read("mold-form.html");
  const handoff = read("assets/grill-artwork-handoff.js");

  assert.match(page, /MrSprinkleArtworkHandoff\.save\(\{ file, notes \}\)/);
  assert.match(handoff, /indexedDB\.open\(DB_NAME, DB_VERSION\)/);
  assert.match(handoff, /file: file/);
  assert.match(form, /urlParams\.get\('quote'\) === 'configurator'/);
  assert.match(form, /MrSprinkleArtworkHandoff\.load\(\)/);
  assert.match(form, /referenceImageInput\.files = transfer\.files/);
  assert.match(form, /fetch\('https:\/\/formspree\.io\/f\/myzpanyg'/);
  assert.match(form, /appointment_availability_status: isConfiguratorBooking/);
  assert.match(form, /thank-you\.html\?booking=grillz/);
  assert.match(form, /within 24 hours to confirm availability/);
});

test("direct grill mold requests validate required customer and safety information", () => {
  const form = read("mold-form.html");
  assert.match(form, /id="customerName"[^>]*required/);
  assert.match(form, /id="email"[^>]*required/);
  assert.match(form, /id="phone"[^>]*required/);
  assert.match(form, /id="healthAcknowledgment"/);
  assert.match(form, /fetch\('https:\/\/formspree\.io\/f\/myzpanyg'/);
  assert.match(form, /Please choose your preferred appointment date and time/);
  const thanks = read("thank-you.html");
  assert.match(thanks, /Your Grill Design Appointment Request Was Received/);
});

test("press-on nail orders carry selected fingers, gold, estimate and artwork to intake", () => {
  const page = read("press-on-nails.html");
  const script = read("assets/press-on-nails.js");
  assert.match(page, /name="nailFinger\[\]"/);
  assert.doesNotMatch(page, /name="faceValue"/);
  assert.match(page, /id="nailAppointmentDate"/);
  assert.match(page, /id="nailPreferredTime"/);
  assert.match(script, /selectedMetal\.perTooth/);
  assert.match(script, /press_on_nails_order_request/);
  assert.match(script, /fetch\(form\.action/);
  assert.match(script, /reference_image_filename/);
  assert.match(script, /payment_status: "not_collected_secure_payment_link_after_quote_approval"/);
  assert.match(script, /thank-you\.html\?service=press-on-nails/);
});

test("ambassador application submits through the current hosted intake", () => {
  const page = read("ambassador.html");
  assert.match(page, /action="https:\/\/formspree\.io\/f\/myzpanyg"/);
  assert.match(page, /portfolio-photos/);
  assert.match(page, /ambassador_application/);
  assert.match(page, /fetch\('https:\/\/formspree\.io\/f\/myzpanyg'/);
});

test("legacy ambassador booking is a request, not a broken PHP booking or auto-applied discount", () => {
  const page = read("ambassador-form-integration.html");
  assert.match(page, /action="https:\/\/formspree\.io\/f\/myzpanyg"/);
  assert.match(page, /id="bookingDate"[^>]*required/);
  assert.match(page, /id="bookingTime"[^>]*required/);
  assert.match(page, /fetch\('https:\/\/formspree\.io\/f\/myzpanyg'/);
  assert.match(page, /verify eligibility and confirm any applicable discount/);
  assert.match(page, /Your appointment is not booked until our team confirms it/);
  assert.doesNotMatch(page, /\/api\/process-booking\.php/);
  assert.doesNotMatch(page, /ambassador-tracking\.js/);
});

test("the music purchase route uses the configured PayPal hosted button and has a matching confirmation", () => {
  const page = read("intro-music.html");
  const track = read("assets/site-track.js");
  const thanks = read("thank-you.html");
  assert.match(page, /paypal\.com\/sdk\/js/);
  assert.match(page, /paypal\.HostedButtons/);
  assert.match(track, /paypalButtonId:\s*"PYSZ68LTCB2VW"/);
  assert.match(track, /price:\s*"\$1\.00"/);
  assert.match(thanks, /urlParams\.get\('music'\)==='damn'/);
});

test("customer intake pages do not collect raw payment card details", () => {
  const pages = ["index.html", "mold-form.html", "press-on-nails.html", "gift-card.html", "ambassador.html", "ambassador-form-integration.html"];
  for (const file of pages) {
    const html = read(file);
    assert.doesNotMatch(html, /name=["'](?:cardNumber|creditCard|card_number|cvv|cvc|securityCode)["']/i, file);
    assert.doesNotMatch(html, /autocomplete=["']cc-(?:number|csc)["']/i, file);
  }
});

test("static customer order and inquiry forms do not point to PHP endpoints", () => {
  const pages = ["index.html", "mold-form.html", "press-on-nails.html", "gift-card.html", "ambassador.html", "ambassador-form-integration.html"];
  for (const file of pages) {
    const html = read(file);
    assert.doesNotMatch(html, /(?:action|href)=["'][^"']+\.php(?:[?#"'])/i, file);
    assert.doesNotMatch(html, /fetch\(["']\/api\/[^"']+\.php/i, file);
  }
});
