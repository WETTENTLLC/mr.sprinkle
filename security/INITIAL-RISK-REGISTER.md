# Mr. Sprinkle Security Risk Register

**Status:** Initial technical review — 2026-11-25  
**Scope:** Public website, connected source repository, Vercel projects, Supabase project, payment backend, and administrative workflows.  
**Important:** Preliminary register based on limited configuration inspection, not a penetration test or independent audit.

| ID | Risk / observation | Initial severity | Required action | Evidence / status |
|---|---|---:|---|---|
| R-01 | Admin dashboard is a static page in the public site repository. The inspected page has noindex metadata, but noindex is not authentication. | Critical | Verify whether live admin page exposes customer or ambassador data or privileged actions. Remove public access or move behind server-side authentication/authorization. | Source reviewed; live access test pending. |
| R-02 | Admin dashboard instructions say the connected Google Sheet is shared as Anyone with the link can view. | High | Remove public link sharing; restrict access to named accounts; inspect sheet contents and access logs; rotate exposed credentials if any. | Source reviewed; sharing setting not yet verified. |
| R-03 | Vercel main project has production environment variables recorded with empty values for SUPABASE_SERVICE_ROLE_KEY, STRIPE_PUB_KEY, SUPABASE_URL, STRIPE, and STRIPE_WEBHOOK_SECRET. | High | Determine whether these are intentionally blank placeholders or actual production configuration. Configure only through Vercel secret settings; never commit values. Verify application behavior without exposing values. | Metadata inspected; values were not decrypted. |
| R-04 | Separate Stripe backend project currently reports no environment variables. | High | Keep payment fulfillment disabled until required sandbox secrets and integrations are configured and verified. Never accept live payments on an incomplete backend. | Metadata inspected. |
| R-05 | Four Supabase tables have RLS enabled but no policies. Current table grants returned only postgres and service_role, not anon/authenticated. | Medium / controlled | Preserve deny-by-default posture. Do not add broad policies. Verify service-role use is server-only and run negative access tests using anon/authenticated credentials. | Grants and policies queried; advisor reports 4 RLS-enabled-no-policy informational findings. |
| R-06 | Supabase gift card tables store encrypted gift card code ciphertext and hashed code; service_role has full table privileges. | Medium | Keep service key server-side, restrict access to backend only, test encryption-key rotation and redemption idempotency, audit access. | Schema inspected; operational controls pending. |
| R-07 | Public PHP and legacy integrations exist in repository; server security guide documents environment-based secrets and least-privilege MySQL. | High | Inventory every deployed PHP endpoint and retire unused test/setup scripts; verify auth, input validation, CSRF protections, and least-privilege DB accounts. | Static sample reviewed; full endpoint inventory pending. |
| R-08 | No confirmed evidence yet of formal access reviews, MFA coverage, incident exercises, restore tests, vendor agreements, or data retention schedule. | High | Assign owners, perform and record these controls; lack of evidence is not proof they do not exist. | Evidence collection pending. |

## Immediate verification checklist
- [ ] Test unauthenticated access to every admin URL and API.
- [ ] Remove anyone-with-link sharing from business/customer spreadsheets.
- [ ] Enable MFA on all administrative platforms.
- [ ] Verify no secrets in repository history, client-side JavaScript, build output, or logs; rotate any exposed secret.
- [ ] Confirm Vercel production variables are correct without disclosing values.
- [ ] Confirm backend project deployment target and payment mode before enabling checkout.
- [ ] Confirm Supabase public/anon/authenticated roles cannot read or write private tables.
- [ ] Inventory all production routes, forms, PHP scripts, and third-party integrations.
- [ ] Verify backups and complete a documented restore test.
- [ ] Create vendor inventory, data inventory, retention schedule, and incident contact list.
- [ ] Complete a documented HIPAA applicability decision before collecting PHI.

## Status language for investor materials
Permitted: Mr. Sprinkle is implementing a security program aligned to selected SOC 2 Trust Services Criteria and ISO/IEC 27001 control objectives. The company is conducting a gap assessment and remediation.

Not permitted unless independently established: SOC 2 certified, SOC 2 compliant, ISO 27001 certified, HIPAA certified, or HIPAA compliant.
