# Server Security Configuration

Configure these values in the hosting provider's server-side environment settings. Do not put credentials in JavaScript, HTML, this repository, or a web-accessible `.env` file.

| Environment variable | Used for |
|---|---|
| `MR_SPRINKLE_DB_HOST` | MySQL host (defaults to `localhost`) |
| `MR_SPRINKLE_DB_NAME` | Application database (defaults to `mr_sprinkle_db`) |
| `MR_SPRINKLE_DB_USER` | Dedicated, non-root MySQL application user |
| `MR_SPRINKLE_DB_PASSWORD` | Strong password for that MySQL user |
| `MR_SPRINKLE_ADMIN_PASSWORD` | Business admin login password |
| `MR_SPRINKLE_ADMIN_API_TOKEN` | Bearer token for restricted ambassador maintenance and diagnostic endpoints |
| `MR_SPRINKLE_SMTP_USER` | Gmail/SMTP account used for admin email |
| `MR_SPRINKLE_SMTP_PASSWORD` | Gmail app password used for admin email |

Use a unique, long random admin password and API token. The API token must remain server-side; never add it to `config.js` or browser requests. The admin API token is required for the standalone ambassador maintenance endpoints and the legacy setup/test scripts.

Create a dedicated MySQL account scoped only to the Mr. Sprinkle application database. Do not use `root`, an account with global privileges, or an account able to create users or databases. For the current PHP flows, a least-privilege starting point is:

```sql
CREATE USER 'sprinkle_app'@'localhost' IDENTIFIED BY '<set-a-unique-secret>';
GRANT SELECT, INSERT, DELETE ON mr_sprinkle_db.ambassadors TO 'sprinkle_app'@'localhost';
GRANT UPDATE (name, email, phone, status, total_referrals, pending_commission, last_referral_date)
    ON mr_sprinkle_db.ambassadors TO 'sprinkle_app'@'localhost';
GRANT SELECT, INSERT ON mr_sprinkle_db.bookings TO 'sprinkle_app'@'localhost';
GRANT SELECT, INSERT ON mr_sprinkle_db.ambassador_referrals TO 'sprinkle_app'@'localhost';
GRANT UPDATE (status, paid_date)
    ON mr_sprinkle_db.ambassador_referrals TO 'sprinkle_app'@'localhost';
GRANT INSERT ON mr_sprinkle_db.ambassador_visits TO 'sprinkle_app'@'localhost';
GRANT INSERT ON mr_sprinkle_db.ambassador_bonuses TO 'sprinkle_app'@'localhost';
```

Apply grants only for tables that exist and features that are enabled, and verify column names against the deployed schema. Do not grant schema-management privileges to the runtime account.

Before deploying, verify that PHP can read the hosting environment variables, that the database account can perform the existing admin and ambassador operations, and that unauthorized requests to maintenance endpoints receive HTTP 403. The local environment does not include PHP or MySQL, so those checks must be completed on a secured staging host.

Rotate any credentials that were previously embedded in source or shared in prior project materials. Removing a secret from the current files does not invalidate copies or repository history.
