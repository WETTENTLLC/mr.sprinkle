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
└── Natalia & other ambassadors
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
   - Password: (create strong password)
   - Click "Create Database"
4. Click "Manage Privileges" → Check all boxes → Save

### Option B: Using MySQL Command Line

```bash
mysql -u root -p
```

```sql
CREATE DATABASE mr_sprinkle_db;
CREATE USER 'sprinkle_user'@'localhost' IDENTIFIED BY 'YourPassword123!';
GRANT ALL PRIVILEGES ON mr_sprinkle_db.* TO 'sprinkle_user'@'localhost';
FLUSH PRIVILEGES;
```

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

Change your backend URL in `config.js`:

```javascript
const CONFIG = {
    // UPDATE THIS with your PHP hosting URL
    BACKEND_URL: 'https://your-domain.com/ambassador-backend-standalone.php',
    // OR if using subdomain:
    // BACKEND_URL: 'https://api.your-domain.com/ambassador-backend-standalone.php',
    
    PORTAL_URL: 'https://mrsprinklereno.com/ambassador-portal.html',
    AMBASSADOR_CODE: 'NATALIA09',
    ADMIN_EMAIL: 'mrsprinklereno@gmail.com'
};
```

**Examples:**
- `https://backend.example.com/ambassador-backend-standalone.php`
- `https://example.com/api/ambassador-backend-standalone.php`
- `https://your-hosting.net/public_html/ambassador-backend-standalone.php`

### Update ambassador-backend-standalone.php

Edit the database credentials at the top of the file:

```php
// ============================================
// CONFIGURATION - UPDATE THESE VARIABLES
// ============================================

// Database credentials
$DB_HOST = 'localhost';      // Your database host (usually localhost)
$DB_USER = 'sprinkle_user';  // Your database username
$DB_PASS = 'YourPassword123!'; // Your database password
$DB_NAME = 'mr_sprinkle_db'; // Your database name
```

**Where to find these:**
- `DB_HOST`: Usually `localhost` (ask hosting provider if unsure)
- `DB_USER`: You created this in STEP 2
- `DB_PASS`: The password you set in STEP 2
- `DB_NAME`: Should be `mr_sprinkle_db`

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

## STEP 5: Set Up Natalia in the Database

### Using phpMyAdmin (Easiest)

1. Log into cPanel
2. Click "phpMyAdmin"
3. Select `mr_sprinkle_db` → `ambassadors` table
4. Click "Insert"
5. Fill in:
   - `ambassador_code`: `NATALIA09`
   - `name`: `Natalia Chacon`
   - `email`: `nataliachacon0904@gmail.com`
   - `phone`: `775-250-9356`
   - `status`: `active`
6. Click "Go"

### Using SQL Query

```sql
INSERT INTO ambassadors 
(ambassador_code, name, email, phone, status, created_at)
VALUES 
('NATALIA09', 'Natalia Chacon', 'nataliachacon0904@gmail.com', '775-250-9356', 'active', NOW());
```

### Using the API (After uploading backend)

```bash
curl -X POST https://your-domain.com/ambassador-backend-standalone.php \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "add-ambassador",
    "code": "NATALIA09",
    "name": "Natalia Chacon",
    "email": "nataliachacon0904@gmail.com",
    "phone": "775-250-9356",
    "status": "active"
  }'
```

---

## STEP 6: Test the Setup

### Test 1: Test Database Connection

Visit (replace with your domain):
```
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
https://your-domain.com/ambassador-backend-standalone.php?endpoint=ambassador-stats&code=NATALIA09
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "ambassador_code": "NATALIA09",
    "name": "Natalia Chacon",
    "email": "nataliachacon0904@gmail.com",
    "phone": "775-250-9356",
    "status": "active",
    ...
  }
}
```

### Test 3: Portal Login

1. Go to: `https://mrsprinklereno.com/ambassador-portal.html`
2. Enter Code: `NATALIA09`
3. Click Login
4. Should see dashboard with Natalia's info

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
3. Make sure email is exactly `nataliachacon0904@gmail.com` (not 0903)
4. Check browser console for error messages

### CORS Errors in Browser Console
**Problem:** "Access to XMLHttpRequest blocked by CORS policy"
**Solution:** Backend already includes CORS headers. If persists:
1. Check backend file has: `header('Access-Control-Allow-Origin: *');`
2. Verify backend URL in config.js is exact match

---

## ✅ Success Checklist

- [ ] PHP hosting account created
- [ ] MySQL database created (`mr_sprinkle_db`)
- [ ] Database user created (`sprinkle_user`)
- [ ] ambassadors table created with schema
- [ ] `ambassador-backend-standalone.php` uploaded
- [ ] Database credentials correct in backend file
- [ ] `config.js` updated with correct backend URL
- [ ] Test endpoint returns success (Test 1)
- [ ] Natalia found in database (Test 2)
- [ ] Portal login works with NATALIA09 (Test 3)
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
- Natalia can log in with NATALIA09
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
5. Natalia can now log in!
