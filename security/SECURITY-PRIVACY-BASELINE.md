# Mr. Sprinkle Security & Privacy Baseline

**Status:** Internal working policy — pending management approval and operational evidence  
**Owner:** Mr. Sprinkle management  
**Review cadence:** Annually and after material system, vendor, or business changes  
**Scope:** mrsprinklereno.com, related APIs, GitHub source, Vercel hosting, Supabase database, Stripe integration, email providers, administrative tools, and personnel or contractors with access.

> This is a security program baseline. It is not a SOC 2 report, ISO/IEC 27001 certificate, HIPAA compliance determination, legal opinion, or assurance that every control is already operating.

## 1. Security objectives
- Preserve confidentiality, integrity, and availability of customer, order, payment, and business information.
- Collect only information needed to provide the requested service.
- Restrict access by job need and remove access promptly when no longer needed.
- Protect credentials and secrets from source code, browser bundles, logs, and public repositories.
- Maintain evidence of changes, reviews, tests, incidents, and remediation.
- Respond to suspected security incidents promptly and preserve relevant evidence.

## 2. Data handling
Classify information as Public, Internal, Confidential, or Restricted. Confidential includes customer contact details, orders, booking details, business financial information, and non-public vendor records. Restricted includes authentication secrets, API keys, payment credentials, identity documents, and legally regulated sensitive information.
- Do not collect full payment card numbers or security codes. Use the payment processor's hosted/tokenized payment flow.
- Do not collect health information unless there is a documented business and legal need.
- Do not represent ordinary health-related data as HIPAA-protected or HIPAA-compliant without a formal applicability assessment.

## 3. Identity and access
- Require MFA on GitHub, Vercel, Supabase, Stripe, email, domain registrar, and other administrative accounts wherever available.
- Use unique accounts; prohibit shared administrator credentials.
- Grant least privilege; separate routine and administrator access.
- Review access at least quarterly and immediately after role changes or departures.
- Store production secrets only in approved server-side secret stores. Never commit secrets or expose privileged keys in browser code.
- Rotate any credential suspected of exposure and invalidate the prior credential.

## 4. Application and infrastructure
- Enforce HTTPS for all production pages and APIs.
- Apply secure response headers appropriate to the application; validate CSP in report-only mode before enforcement.
- Validate and constrain all inputs server-side; use parameterized database queries.
- Apply rate limits and abuse controls to authentication, forms, checkout, and public APIs.
- Keep dependencies pinned with lockfiles; review and remediate security advisories.
- Separate development, preview, and production configuration and data.
- Protect administrative interfaces with real server-side authentication and authorization. Noindex and obscured URLs are not access controls.
- Keep database RLS enabled on exposed schemas and verify grants and policies against the intended access model.
- Log security-relevant administrative and payment events without recording secrets, full payment data, or unnecessary personal data.

## 5. Change and release management
- Use pull requests for production changes.
- Require automated tests and review of security-sensitive changes before release.
- Keep deployment and database migration history.
- Do not deploy untested security changes directly to production.
- Maintain rollback instructions for application and schema releases.

## 6. Vulnerability management
- Review dependency and platform security advisories regularly.
- Triage critical and high-severity issues promptly; document owner, severity, remediation, and closure evidence.
- Perform recurring configuration reviews and security tests.
- Do not describe an unperformed penetration test or scan as completed.

## 7. Backups and continuity
- Confirm database backup schedule, retention, encryption, and restoration capability with the provider.
- Perform and record a restore test at least annually and after major architecture changes.
- Document recovery priorities, responsible contacts, and manual fallback procedures.

## 8. Incident response
For suspected compromise, data exposure, unauthorized access, payment fraud, or service disruption: record discovery time and facts; contain without destroying evidence; revoke or rotate affected credentials; preserve logs and deployment identifiers; assess data types, people affected, scope, and legal or contractual notification duties; restore from known-good systems; and document root cause and corrective actions. Management must determine applicable notification deadlines with qualified counsel; do not assume one universal deadline applies.

## 9. Vendor and processor management
Maintain a vendor inventory covering service, data handled, access, hosting region where known, security documentation, contract terms, incident notification, retention/deletion, and whether a data processing agreement or business associate agreement is required. Do not send regulated health information to a vendor until its suitability and required agreements are confirmed.

## 10. Privacy and retention
Publish accurate privacy disclosures describing collected data, purposes, processors, retention, and contact methods. Establish retention periods by data type and delete data securely when no longer needed, subject to legal, tax, accounting, and dispute requirements. Honor applicable privacy rights requests.

## 11. Evidence
Retain dated evidence for access reviews, MFA status, code reviews, CI results, vulnerability remediation, database advisor results, backup/restore tests, incidents, vendor reviews, policy approvals, and risk assessments. Restrict evidence-room access and redact secrets and unnecessary customer information.

## 12. HIPAA applicability gate
Before accepting or storing protected health information, management must document whether Mr. Sprinkle is a HIPAA covered entity or business associate for the specific activity. If applicable, complete a formal risk analysis, required safeguards, workforce training, incident/breach procedures, and required business associate agreements. This policy alone does not establish HIPAA compliance.

## 13. Governance and review
Management owns this program, assigns control owners, reviews the risk register at least quarterly, approves exceptions with documented rationale and expiry, and reviews this policy at least annually.
