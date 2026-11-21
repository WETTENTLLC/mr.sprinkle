# Ambassador System - Option 1 Setup Guide
## GitHub Static + Separate PHP Backend

This guide walks you through setting up a separate PHP backend to handle ambassador database queries while keeping your static site on GitHub.

---

## 🎯 Architecture

```
GitHub Pages (Static)
├── ambassador-portal.html ✓
├── ambassador-new.html ✓
├── mold-form.html ✓
├── config.js (NEW) ← Points to external backend
└── Other HTML/CSS/JS

PHP Hosting (Backend)
├── ambassador-backend-standalone.php ✓ (Handles all DB queries)
├── Database (MySQL)
└── sample ambassador & other ambassadors
```

---

## STEP 1: Get PHP Hosting

Choose a cheap PHP hosting provider with MySQL:

| Provider | Price | Features | Link |
|----------|-------|----------|------|
| **Namecheap** | $2.88/mo | PHP + MySQL + Support | namecheap.com |
| **Bluehost** | $2.95/mo | PHP + MySQL + WordPress | bluehost.com |
| **GoDaddy** | $2.99/mo | PHP + MySQL + cPanel | godaddy.com |
| **HostGator** | $2.75/mo | PHP + MySQL + cPanel | hostgator.com |
| **SiteGround** | $2.99/mo | PHP + MySQL + Support | siteground.com |

**What you need:**
- ✓ PHP 7.4 or higher
- ✓ MySQL 5.7 or higher
- ✓ cPanel or control panel (for file uploads)
- ✓ Free SSL certificate (usually included)

---

## STEP 2: Set Up the Database

### Option A: Using cPanel (Easiest)

1. Log into your hosting control panel (cPanel)
2. Find "MySQL Databases"
3. Create new database:
   - Name: `mr_sprinkle_db`
   - Username: `sprinkle_user`
   - Password: create a unique strong password and store it only in the hosting environment settings
   - Click "Create Database"
4. Grant only the database and table privileges required by the deployed PHP features. Do not grant global or schema-management privileges.

### Option B: Using MySQL Command Line

```bash
mysql -u root -p
```

```sql
CREATE DATABASE mr_sprinkle_db;
CREATE USER 'sprinkle_user'@'localhost' IDENTIFIED BY '<set-a-unique-secret>';
FLUSH PRIVILEGES;
```

Apply only the reviewed table/column grants in [SERVER-SECURITY-SETUP.md](./SERVER-SECURITY-SETUP.md). See it for all required server environment variables and least-privilege guidance.

### Option C: Import Database Schema

1. Use your hosting control panel's phpMyAdmin
2. Create the ambassadors table:

```sql
CREATE TABLE ambassadors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ambassador_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    total_referrals INT DEFAULT 0,
    paid_commission DECIMAL(10,2) DEFAULT 0,
    pending_commission DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_referral_date TIMESTAMP NULL
);
```

---

## STEP 3: Update Configuration Files

### Update config.js

The ambassador portal uses the same-origin `ambassador-backend.php` endpoint configured in `config.js`. Do not add a database password, admin password, API token, or ambassador code to this browser-side file. The standalone backend is for secured maintenance/diagnostic access and is not the portal's public data endpoint.

```javascript
const CONFIG = {
    BACKEND_URL: 'https://mrsprinklereno.com/ambassador-backend.php',
    
    PORTAL_URL: 'https://mrsprinklereno.com/ambassador-portal.html',
    ADMIN_EMAIL: 'mrsprinklereno@gmail.com'
};
```

Set database, admin, API-token, and SMTP credentials in the hosting provider's environment settings. The PHP connection code intentionally rejects the MySQL `root` account.

---

## STEP 4: Upload Files to PHP Hosting

### Using cPanel File Manager (Easiest)

1. Log into cPanel
2. Click "File Manager"
3. Navigate to `public_html/` folder
4. Upload these files:
   - `ambassador-backend-standalone.php` → Upload as `ambassador-backend-standalone.php`
   - Or rename to: `api.php` or `backend.php`
5. Right-click → File Permissions → Set to `644`

### Using SFTP

```bash
sftp username@your-hosting.com
cd public_html
put ambassador-backend-standalone.php
put ambassador-backend-standalone.php
exit
```

### Using Git (If hosting supports it)

```bash
cd ~/your-hosting-dir
git clone https://github.com/WETTENTLLC/mr.sprinkle.git
```

---

## STEP 5: Manage Ambassador Records

Add, update, and remove ambassador records through the authenticated business admin portal. Do not copy real ambassador contact details or access codes into browser-side configuration, scripts, or public documentation.

### Using SQL Query

```sql
INSERT INTO ambassadors 
(ambassador_code, name, email, phone, status, created_at)
VALUES 
('<ambassador-code>', '<name>', '<email>', '<phone>', 'active', NOW());
```

### Using the API (After uploading backend)

```bash
curl -X POST https://your-domain.com/ambassador-backend-standalone.php \
  -H "Authorization: Bearer $MR_SPRINKLE_ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "add-ambassador",
    "code": "<ambassador-code>",
    "name": "<name>",
    "email": "<email>",
    "phone": "<phone>",
    "status": "active"
  }'
```

---

## STEP 6: Test the Setup

### Test 1: Test Database Connection

Request this diagnostic endpoint with the server-side API token (replace the domain):
```
curl -H "Authorization: Bearer $MR_SPRINKLE_ADMIN_API_TOKEN" \
  https://your-domain.com/ambassador-backend-standalone.php?endpoint=test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "ambassadorCount": 1,
  "databaseColumns": [...]
}
```

### Test 2: Get Ambassador Stats

Visit:
```
https://mrsprinklereno.com/ambassador-backend.php?endpoint=ambassador-stats&code=<ambassador-code>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "ambassador_code": "<ambassador-code>",
    "name": "<ambassador-name>",
    "status": "active",
    "total_referrals": 0,
    "paid_commission": 0,
    "pending_commission": 0,
    ...
  }
}
```

### Test 3: Portal Login

1. Go to: `https://mrsprinklereno.com/ambassador-portal.html`
2. Enter the ambassador code provided to that ambassador
3. Click Login
4. The dashboard should show the matching ambassador profile and stats

The current portal lookup uses an ambassador code as its access check; it is not password-based authentication. Treat the code as sensitive and do not publish or reuse it as a password. A stronger account login requires an owner-approved credential and recovery workflow.

---

## STEP 7: Commit to GitHub

Update your local config.js with the correct backend URL, then:

```bash
cd Mr.Sprinkle
git add config.js ambassador-portal.html ambassador-backend-standalone.php
git commit -m "Add separate PHP backend support - GitHub static + external PHP host"
git push origin master
```

---

## 📋 Troubleshooting

### Backend File Downloads Instead of Executing
**Problem:** `ambassador-backend-standalone.php` downloads when visited
**Solution:** PHP might not be enabled. Contact hosting provider.

### "404 Not Found" Error
**Problem:** Backend file not accessible
**Solutions:**
1. Check file was uploaded to correct location
2. Verify filename is exactly `ambassador-backend-standalone.php`
3. Check file permissions are 644
4. Try accessing file directly from cPanel File Manager

### "Database Connection Failed"
**Problem:** Can't connect to database
**Solutions:**
1. Verify `DB_HOST` is correct (ask hosting)
2. Check username and password in config
3. Make sure database was created
4. Verify user has database privileges

### Portal Shows "Invalid ambassador code"
**Problem:** Ambassador not found in database
**Solutions:**
1. Run Test 2 above to verify backend works
2. Check ambassador record exists in phpMyAdmin
3. Verify the record's contact information directly in the secured admin system.
4. Check browser console for error messages

### Cross-Origin Request Errors
The portal and its backend are intended to be same-origin. Do not restore wildcard CORS headers. If hosting changes, configure and test a narrowly allowlisted origin rather than allowing every website.

---

## ✅ Success Checklist

- [ ] PHP hosting account created
- [ ] MySQL database created (`mr_sprinkle_db`)
- [ ] Dedicated restricted database user created and configured in server environment settings
- [ ] ambassadors table created with schema
- [ ] `ambassador-backend-standalone.php` uploaded
- [ ] Required environment variables configured server-side; no secrets stored in source
- [ ] `config.js` updated with correct backend URL
- [ ] Authorized diagnostic request succeeds and an unauthorized request receives HTTP 403
- [ ] Ambassador stats endpoint returns only the fields needed by the portal
- [ ] Portal code lookup works for an authorized test account
- [ ] GitHub updated with new config.js

---

## 🎉 What You Now Have

✅ **GitHub Pages**
- Static HTML/CSS/JS
- All your website files
- No PHP execution needed

✅ **Separate PHP Backend**
- Handles all database queries
- Secure database credentials (not in GitHub!)
- Can scale independently
- Low cost ($2-5/month)

✅ **Ambassador System**
- Portal connects to database
- Referral tracking works
- Commission calculations ready

---

## 📞 Support

If you need help:
1. Check troubleshooting section above
2. Visit your hosting provider's support
3. Check PHP error logs in cPanel
4. Test backend directly with test endpoint

---

## Next Steps

1. Choose a PHP hosting provider
2. Follow STEP 1-5 setup
3. Test everything (STEP 6)
4. Update GitHub (STEP 7)
5. sample ambassador can now log in!
