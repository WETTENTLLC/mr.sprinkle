# Gold Grill Designer 2.0: Milestone 1 Audit and Isolation

**Date:** November 20, 2026
**Repository:** WETTENTLLC/mr.sprinkle
**Baseline:** `master` @ `c90d3a8`, which is what mrsprinklereno.com serves today
**Development branch:** `feature/gold-grill-designer-2`. Created locally from `master`. It is **not pushed**, has no upstream, and has push disabled.
**Status:** Milestone 1 is ready for your review. Milestone 2 starts after you approve.

Status key:
- **COMPLETE:** tested
- **PARTIAL:** works with gaps
- **BROKEN:** does not work as intended
- **UNVERIFIED:** not tested
- **PLANNED:** not built

---

## 1. Hosting and deployment (brief §3)

| Item | Finding | Status |
|---|---|---|
| Hosting provider | **GitHub Pages**, legacy build from `master`, root folder. The custom domain `mrsprinklereno.com` is set in `CNAME`. DNS A records point to 185.199.108–111.153, and `www` is a CNAME to `wettentllc.github.io`. I confirmed this from the GitHub Pages API and DNS. | COMPLETE |
| Deployment process | **Any commit to `master` goes live within minutes.** There's no build step, no staging, no tests, and no approval gate. | COMPLETE |
| Automatic commits to production | `.github/workflows/sync-google-drive-images.yml` runs **daily at 2 AM UTC**. It commits new Google Drive images straight to `master`, which deploys them. | COMPLETE |
| HTTPS | `https_enforced: false`. `http://mrsprinklereno.com/` serves the page without redirecting to HTTPS. | Issue found |
| Server-side code | **None runs.** GitHub Pages is static hosting, so the 20+ `.php` files never execute. They're served as downloadable text (`updated-pricing.php` returns 200, `application/x-httpd-php`). | COMPLETE |
| Framework and dependencies | Plain HTML, CSS, and inline JavaScript across 27 root HTML pages, with no framework and no bundler. The shared stylesheets are `styles.css`, `mold-form.css`, and `mold-form-clean.css`. `package.json` and `package-lock.json` belong to an unrelated Puppeteer tool and the site doesn't use them. | COMPLETE |

**Implication for this project:** the brief requires server-side pricing, persistent saved designs, private photo storage, an authenticated admin, and PDF production sheets. **GitHub Pages can't run any of that.** Production will need a separate backend host while the public site stays on GitHub Pages. Choosing that host is an owner decision (§7). Staging doesn't depend on that choice.

## 2. Existing grill form (`mold-form.html`, 796 lines)

| Area | What exists | Status |
|---|---|---|
| Tooth diagram | Twenty clickable `.tooth` elements with `data-tooth`: upper 15–11 and 21–25, lower 45–41 and 31–35. This matches the brief's supported set exactly. Tapping toggles a `selected` class. The global `selectedTeeth` array feeds the `#selectedTeethList` display and the hidden `selectedTeeth` input. | COMPLETE |
| Presets, undo, clear | None | PLANNED (M2) |
| Per-tooth configuration | None. There's one `materialType` for the whole order, one `diamondType` (with no size, grade, or count), a free-text `gemPlacement`, `imageDescription`, and `design`. | PLANNED (M2) |
| Materials offered | 10K, 14K, 18K, 24K, white gold, platinum, silver. **14K Dental Gold is missing** even though it's a published price. | Gap |
| Gem options | White, yellow, black, and colored diamonds, plus rubies, sapphires, emeralds, and custom gems. There's **no lab-grown, moissanite, or CZ** option, even though those are published prices. | Gap |
| Budget | Required `budget` range dropdown | COMPLETE |
| Image upload | `<input type="file" name="referenceImage" accept="image/*">` sent inside the Formspree FormData. There's no size or type check beyond `accept`. Whether attachments actually arrive depends on the Formspree plan, and I didn't test it to avoid a live submission. | UNVERIFIED |
| Mold kit | A `toggleMoldKit()` button for +$40 that reveals required address fields. | COMPLETE |
| Rush | `rushDelivery` select, "+$150" | COMPLETE |
| Payment | A `paymentMethod` select (cash, Zelle, Venmo, Cash App, PayPal). It's **only a preference; no payment is processed.** | COMPLETE |
| Promo codes | Checked **only in the browser**: `SPRINKLED26` shows "$50 credit", and `BIRTHDAY20` shows "20% OFF". Nothing applies or enforces them. Customers see "applied" text but no price changes. | Issue found |
| Health acknowledgment | A required checkbox linking to `safety-policy.html` | COMPLETE |
| Ambassador referral | `?ref=` is saved to the customer's own browser storage and a hidden `ambassadorCode` field. | COMPLETE |
| Chat widget | Calls `api.x.ai` with `API_KEY='YOUR_GROK_API_KEY_HERE'`, so **it always fails** and falls back to "Text (530) 214-0676". Its prompt also quotes "**$200–400/tooth**", which contradicts published pricing. | BROKEN |
| Mobile layout (live, tested in a headless browser) | No horizontal overflow at 320, 390, or 768 px, and no script errors. Tooth targets are **31×38 px**, below the recommended 44 px touch size. | COMPLETE, with a gap |

## 3. Form processing, email, and storage integrations

| Integration | Where | Behavior | Status |
|---|---|---|---|
| Formspree `myzpanyg` | `mold-form.html` | Email notification to the owner. It's sent by `fetch` with `Accept: application/json`. | COMPLETE (live) |
| Google Apps Script → Sheets | `mold-form.html` | A JSON copy of the order is sent with `mode: 'no-cors'`, so **failures are invisible**. | UNVERIFIED |
| Error handling | `mold-form.html` submit handler | The `catch` block **still redirects to `thank-you.html`**. If both services fail, the customer sees a thank-you page and the order is lost. | Issue found |
| `form-to-admin.js` | Loaded by `mold-form.html` | Writes ambassador leads to the **customer's own** browser storage. The owner's admin dashboard never sees them. The `mailto` alert is commented out. | BROKEN (no effect) |
| PHP mailers | `phpmailer-setup.php`, `simple-gmail.php`, `gmail-smtp.php`, `test-email.php`, `form-handler.php` | They can't run on GitHub Pages. Some contain credentials, see §5. | Not functional |
| PayPal | `gift-card.html` (classic `webscr` form), `intro-music.html` (hosted-button SDK) | Live payment links on other pages. The grill form doesn't use them. | COMPLETE (out of scope) |
| Booking | No calendar or booking integration. `squarespace-booking-form.html` is a standalone file. | — | — |

**Protected under the brief (§2.2):** none of these files are modified on the development branch. The designer will add its own staging-only notification path and won't reuse Formspree, Sheets, Gmail, Zapier, or PayPal.

## 4. Published price logic

| Source | Prices | Agrees with the brief? |
|---|---|---|
| `pricing.html` (live) | Silver $100, 10K $240, 14K $300, 14K Dental $320 per tooth, with 6- and 12-tooth totals. The stone table, cuts (+$15, +$10, +$20, +$15), rush $150, and mold kit $40 are also listed. | **Yes**, every figure in brief §9 matches. |
| V2 branch `assets/pricing-catalog.js` (not live) | Same figures | Yes |
| `updated-pricing.php` (live, downloadable) | "$180 per tooth fully iced", "basic $200", "premium $500", **plus wholesale costs and profit-margin math** | **No, it conflicts.** It also **exposes internal cost data publicly.** |
| `mold-form.html` chat prompt | "$200–400/tooth for gold" | **No, it conflicts.** |

The draft catalog for the designer is `grill-designer/config/pricing-catalog.v0.json`, marked `owner_verified: false`. Prices without an approved figure (18K, 24K, white gold, platinum, rubies, sapphires, emeralds, custom stones, labor, custom design) are stored as `null` and flagged quote-required. Cuts, shipping, and rush are marked as **not charged automatically** until you verify them. A unit test checks every figure against the published table.

## 5. Security warning (brief §2.4)

I did not use or display any secret values from the repository. Here's what's still exposed today:

| Exposure | Where | Fix | Who |
|---|---|---|---|
| Gmail app password, admin password | `phpmailer-setup.php`, `simple-gmail.php`, `business-admin.php`. They're **live and downloadable** and in all of git history. | **Rotate now** in Google and in the admin system. | Owner. I can't access these accounts. |
| Grok (xAI) API key, Zapier webhook | `.env` in **public git history** (the file returns 404 on the site) | **Revoke and reissue** in the xAI console and Zapier. | Owner |
| Wholesale costs and margins | `updated-pricing.php`, live | Remove from `master` (a production change) | Needs your approval |
| History | Deleting files later **doesn't remove them from public history**, and the repo is public. | Rotating the secrets makes the history copies useless. A history purge (`git filter-repo` plus force-push) is optional and **needs your written approval**, because it rewrites history. | Owner decision |
| Plain-HTTP access | GitHub Pages settings | Turn on "Enforce HTTPS" (a production setting change) | Needs your approval |

The development branch is based on `master`, so it still *contains* those old files. They're unchanged and not served from staging. The designer code never reads them, and the isolation scan (§6) rejects any reference to them.

## 6. Isolation (brief §2.1–2.3)

| Requirement | How it's met | Status |
|---|---|---|
| New development branch | `feature/gold-grill-designer-2` from `c90d3a8`. **Upstream removed and `pushRemote` set to an invalid name**, so an accidental `git push` fails. | COMPLETE |
| No production files changed | All new work is in `grill-designer/`. `git diff --stat master` shows additions only in that folder. | COMPLETE |
| Isolated staging environment | A FastAPI server (`grill-designer/server/`) running in the Perplexity sandbox, behind a **private preview link that only you can open**. It has no public URL and isn't indexed (`noindex`). | COMPLETE |
| Staging doesn't connect to production | `server/isolation.py` **refuses to start** in these cases: `GGD_APP_ENV` isn't `staging`, the database or uploads folder is outside `grill-designer/var/`, notifications are anything other than the local `outbox`, or any setting contains a production identifier (Formspree form, Sheets script, xAI, Zapier, the business inbox, Gmail SMTP, PayPal). | COMPLETE (tested) |
| Staging database | SQLite at `grill-designer/var/staging.db` (git-ignored). `migrations/001_initial_schema.sql` creates all brief §13 entities, plus `admin_users` and `reference_sequence`. | COMPLETE |
| Secrets never committed | `grill-designer/.gitignore` excludes `var/` and every `.env*` file except `.env.staging.example`, which contains no secret values. | COMPLETE |
| No payments | There's no payment code. The scan flags any PayPal reference. | COMPLETE |

**Tests:** 8 of 8 pass (`python -m pytest`). They cover:
- refusing production mode
- refusing a missing environment
- refusing a database outside the staging folder
- refusing live notification modes
- refusing production endpoints in settings
- a clean source scan
- API baseline and schema
- catalog figures matching the published prices

`python tools/check_isolation.py` → PASS.

**Staging limitation:** the staging server runs in this sandbox. It stays up while the sandbox session is active and isn't durable hosting. A durable staging host is part of the backend-host decision in §7.

## 7. Owner decisions needed before Milestone 2

1. **Approve this baseline.** Approve Milestone 1 and authorize Milestone 2: tooth diagram, presets, per-tooth configuration, and saved drafts.
2. **Production backend host (needed by Milestone 6, not now).** GitHub Pages stays for the public site, and a separate API host serves the designer. Options include Render or Fly.io (keeps the FastAPI code), Cloudflare Workers with D1, or Supabase. Each has a monthly cost and account setup that you'd own.
3. **Push the branch?** The branch is local only. Pushing `feature/gold-grill-designer-2` to GitHub doesn't affect the live site (Pages builds only from `master`), but your earlier rules forbid pushing without approval.
4. **Pricing confirmations (§22):**
   - per-tooth pricing for any tooth count
   - whether cut charges are per tooth or per piece
   - whether shipping applies to in-person Envy Kutz appointments
   - rush service vs. rush shipping
   - setting labor rules
   - approved stone sizes and grades
   - 18K, 24K, white gold, and platinum pricing, or keep them quote-only
5. **Security:** rotate the four exposed credentials (§5). Separately approve removing `updated-pricing.php` and enforcing HTTPS on the live site.
