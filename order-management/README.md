# Mr. Sprinkle Order Management — Phase 1

This folder contains an additive order-management schema and the first secure PHP admin API/UI slice.

## Important architecture notes

- The existing site is a static HTML/CSS/JS site on the `master` branch, with legacy PHP/MySQL ambassador files. The root `package.json` does not describe the customer-facing site build.
- Do not deploy PHP API files to GitHub Pages; PHP must run on an actual PHP host with MySQL.
- Existing ambassador tables are not altered by this migration.
- The API is disabled until `MS_DB_HOST`, `MS_DB_NAME`, `MS_DB_USER`, `MS_DB_PASS`, and `MS_ADMIN_TOKEN_HASH` are configured as hosting environment variables.
- `MS_ADMIN_TOKEN_HASH` is a SHA-256 hash of a long random admin bearer token. Keep the raw token in a password manager; never commit it.
- Deploy this folder to a PHP 8.1+ host or subdirectory on the current hosting account, with HTTPS enabled.
- Restrict `/admin/` and `/api/` to HTTPS. Configure rate limiting at the hosting layer.
- Do not enable public order creation until checkout/payment provider verification is implemented.

## Files

- `schema.sql`: additive MySQL schema and verified E Gold USA invoice 121142 ledger import.
- `api.php`: authenticated JSON API for orders and status changes.
- `index.php`: admin login screen and order register.
- `config.example.php`: environment configuration example only; contains no credentials.

## Install

1. Back up the existing MySQL database.
2. Create/choose the MySQL database used by the Mr. Sprinkle site.
3. Import `schema.sql` using phpMyAdmin or mysql CLI.
4. Upload this folder to the PHP host as `/admin/management/`.
5. Configure environment variables on the host (not in GitHub).
6. Generate a random admin token and set its SHA-256 hash as `MS_ADMIN_TOKEN_HASH`. The API uses the token as a bearer credential.
7. Confirm `/admin/management/api.php?action=health` returns healthy only after server credentials are configured.
8. Open `/admin/management/`, enter the raw token, and test a small internal order before connecting customer checkout.
9. Run SQL checks that invoice subtotal and cost categories reconcile.

## Invoice seed: E Gold USA #121142

- Invoice subtotal: $2,146.94
- Payments/credits: $2,000.00
- Invoice balance due: $146.94
- Account total balance: $769.33 (separate from invoice balance)
- Itemized into metal, labor, stones, and supplier shipping based on the supplied one-page PDF.
- Invoice labor costs are recorded as supplier invoice costs; they are not automatically applied to any retail price.

## Known launch gates

- Review admin legal/policy text, deposits and refunds.
- Configure database credentials and admin bearer token securely.
- Verify current PHP hosting and database access.
- Configure automated backups and least-privilege database user.
- Add CSRF protection if replacing bearer token auth with cookie sessions.
- Implement payment provider webhooks before treating payment status as authoritative.
- Implement private invoice attachment storage (never public web root).
- Add order email notifications after sender domain authentication and templates are approved.
- Verify no legacy secret remains in the GitHub history; rotate any credentials found in historical commits.
