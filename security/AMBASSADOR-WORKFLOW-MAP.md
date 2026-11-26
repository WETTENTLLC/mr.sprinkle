# Ambassador and booking workflow map

**Review date:** 2026-11-25  
**Scope:** Static source review of the repository's current `master` branch. This is not proof that every listed file is deployed or active.

## Observed browser-to-server paths

| Surface | Source behavior | Security implication | Status |
|---|---|---|---|
| Referral landing | `ambassador-integration.js` reads `?ref=` or browser localStorage, stores the code, posts it to `/api/track-visit.php`, and adds it to forms. | Referral codes are attribution identifiers, not proof of an authenticated ambassador. Client state is attacker-controlled. | Source confirmed; API route not found in repository tree. |
| Mold form | `mold-form.html` reads a referral code into a hidden field and submits customer/order information to Formspree. | Server-side discount and commission must not trust hidden fields. Formspree workflow needs separate access/retention review. | Source confirmed; external form account configuration not inspected. |
| Older booking tracker | `ambassador-tracking.js` posts to `/api/track-visit.php` and `/api/process-booking.php`. | Referenced `/api/*.php` handlers were not present in the repository's `master` tree. Do not assume these routes work on Vercel or that they are deployed. | Caller found; route implementation unresolved. |
| Ambassador portal | `ambassador-portal.html` posts an ambassador code to `ambassador-backend-standalone.php?endpoint=ambassador-stats` and treats the returned record as a successful login. | A referral code is effectively a password; the stats endpoint in source is unauthenticated and returns identity/status/commission fields. | Source confirmed; hosting and live route not verified. |
| PHP ambassador dashboard | `ambassador-dashboard.php` checks for an active code and then stores the code and name in a PHP session. | Code-only authentication; no CSRF protection or throttling was evident in the inspected login. | Source confirmed; hosting and live route not verified. |
| Admin dashboard | `admin-dashboard.html` loads Google Sheet CSV directly in browser, keeps ambassador data in localStorage, and writes via a Google Apps Script URL. | No server-side admin identity in this page; customer/ambassador data may be exposed if the sheet or script is broadly accessible. HTML rendering also interpolates sheet values into HTML. | Source confirmed; sharing and Apps Script access settings not inspected. |
| Business admin | `business-admin.php` uses `MR_SPRINKLE_ADMIN_PASSWORD`, a PHP session, CSRF tokens, and prepared SQL statements. | Better baseline than static dashboard, but single shared password, direct comparison, and no evident MFA or throttling. | Source confirmed; hosting and runtime settings not verified. |

## Conflicting or duplicate booking logic

Three PHP files contain overlapping booking/referral processing:

- `ambassador-backend.php`: 10% discount whenever any code is submitted; referral commission is hard-coded at 20%.
- `form-handler.php`: 10% discount whenever any code is submitted; referral commission is hard-coded at 20%.
- `tiered-ambassador-system.php`: 5% discount whenever any code is submitted; monthly referral count determines 10%, 15%, or 20% commission.

These implementations disagree on the customer discount and commission calculation. The active production path must be identified before consolidation. No pricing or commission rules should be changed based on this static review alone.

## Deployment boundary

The repository's root website is associated with Vercel, while PHP source files require a PHP-capable runtime. The repository tree did not contain the referenced `/api/track-visit.php` or `/api/process-booking.php` files. Vercel project metadata inspected during this review showed the latest deployment was not a production target and the project reported `live: false`. Therefore the live hosting location for PHP, the deployed routes, and the operational Google Apps Script deployment remain unverified.

## Safe remediation order

1. Confirm hosting and route ownership for every PHP endpoint and the Google Apps Script.
2. Restrict the static admin dashboard and remove public spreadsheet access if enabled; move privileged actions to an authenticated server-side service.
3. Replace ambassador-code-only login with individual credentials and authenticated sessions; protect stats by session identity.
4. Make referral codes attribution-only. Validate that the code belongs to an active ambassador server-side before applying any discount or commission.
5. Select one canonical booking/pricing implementation only after the live path and approved business rules are confirmed.
6. Add input validation, output encoding, CSRF protection for cookie-authenticated state changes, abuse throttling, and audit logging.
7. Run negative access tests and booking regression tests in a staging environment before production rollout.

## Evidence limitations

This review inspected repository source and deployment metadata. It did not access the Google Sheet, Google Apps Script deployment settings, PHP host, Formspree account, or customer data. Live HTTP checks could not be completed from the execution environment due to DNS/network resolution failure. No conclusion about actual public exposure or current customer-data compromise is justified from this evidence alone.
