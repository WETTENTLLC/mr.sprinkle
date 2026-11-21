# ✅ AMBASSADOR SYSTEM - DEPLOYMENT CHECKLIST

> **Legacy document:** The status and deployment claims below are historical and do not describe the current branch or production. The current portal uses the PHP backend, not browser-side ambassador storage. Do not use this checklist to commit, push, or deploy. Ambassador portal access is still code-only and is not suitable for confidential account information until a secure login/recovery flow is approved and implemented.

## 📦 What's Been Prepared (In GitHub)

| Item | Status | Details |
|------|--------|---------|
| Code Push | ✅ DONE | All changes committed and pushed to `WETTENTLLC/mr.sprinkle` master branch |
| Portal Auth Fix | ✅ DONE | `ambassador-portal.html` updated to validate against database |
| Backend API | ✅ DONE | `ambassador-backend.php` with proper query routing |
| sample ambassador Setup | ✅ DONE | Scripts ready to add her with correct email (ambassador@example.com) |
| Testing Script | ✅ DONE | `ambassador-system-setup-test.php` provided for production verification |
| Documentation | ✅ DONE | Complete testing and troubleshooting guide included |

---

## 🚀 YOUR NEXT STEPS (On Production Server)

### Step 1: Pull Latest Code
```bash
# SSH into your server or use your hosting control panel
cd /path/to/mrsprinklereno.com
git pull origin master
```

**What this deploys:**
- ✓ `ambassador-portal.html` - Fixed login with database validation
- ✓ `ambassador-backend.php` - Working API endpoint
- ✓ `ambassador-new.html` - Enhanced signup tracking
- ✓ `business-admin.php` - Updated portal URL
- ✓ `ambassador-system-setup-test.php` - Testing tool
- ✓ `AMBASSADOR-TESTING-GUIDE.md` - Documentation

### Step 2: Run System Test
Open in browser:
```
https://mrsprinklereno.com/ambassador-system-setup-test.php
```

This will:
1. ✓ Verify database connection
2. ✓ Add/update sample ambassador (if not already added)
3. ✓ Confirm she's in the system with correct email
4. ✓ List all ambassadors
5. ✓ Provide next steps and troubleshooting

### Step 3: Test the ambassador's Login
Visit:
```
https://mrsprinklereno.com/ambassador-portal.html
```

Login as:
- Code: `<ambassador-code>`

Expected to see:
- Dashboard with "Welcome, sample ambassador!"
- Referral link containing <ambassador-code>
- Commission structure table
- Stats section
- Share options

### Step 4: Verify API Works
Test the backend directly:
```
https://mrsprinklereno.com/ambassador-backend.php?endpoint=ambassador-stats&code=<ambassador-code>
```

Should return JSON with the ambassador's data

---

## 🎯 Success Indicators

✅ **Setup Test Shows:**
- Database: Connected
- Ambassadors Table: Found
- sample ambassador: Listed
- Status: Active

✅ **Portal Test Shows:**
- Page loads without errors
- "Welcome, sample ambassador!" displays
- Dashboard with referral link visible
- No "localStorage fallback" errors

✅ **API Test Shows:**
- JSON response with ambassador data
- No 404 or connection errors
- the ambassador's correct email: ambassador@example.com

---

## 📊 What Each File Does

### ambassador-portal.html
- **What it is:** the ambassador's login page
- **What changed:** Now validates codes against database (not just localStorage)
- **How to test:** Login with <ambassador-code>

### ambassador-backend.php
- **What it is:** API endpoint that queries the database
- **What changed:** Accepts query parameters (?endpoint=ambassador-stats&code=...)
- **How to test:** Visit URL with ?endpoint=ambassador-stats&code=<ambassador-code>

### ambassador-system-setup-test.php
- **What it is:** Automated testing and setup tool
- **What it does:** 
  - Connects to database
  - Adds/updates sample ambassador
  - Lists all ambassadors
  - Shows troubleshooting guide
- **How to use:** Visit on live server, read results, follow next steps

---

## ⚙️ Technical Details for Your Reference

### Database Record (Will Be Created)
```
Code: <ambassador-code>
Name: sample ambassador
Email: ambassador@example.com
Phone: (555) 010-0000
Status: active
```

### Login Flow
```
1. sample ambassador enters <ambassador-code> in portal
2. Portal sends: /ambassador-backend.php?endpoint=ambassador-stats&code=<ambassador-code>
3. Backend queries: SELECT * FROM ambassadors WHERE ambassador_code = '<ambassador-code>'
4. Returns JSON with her data
5. Portal displays dashboard
```

### Expected API Response
```json
{
  "success": true,
  "data": {
    "id": "N",
    "ambassador_code": "<ambassador-code>",
    "name": "sample ambassador",
    "email": "ambassador@example.com",
    "phone": "(555) 010-0000",
    "status": "active",
    "total_referrals": 0,
    "paid_commission": 0.00,
    "pending_commission": 0.00,
    "created_at": "2026-03-03 XX:XX:XX"
  }
}
```

---

## 🆘 If Something Goes Wrong

### Portal Login Shows "Invalid ambassador code"
1. Run setup test script and verify sample ambassador is listed
2. Check that git pull was successful
3. Verify ambassador-backend.php exists on server
4. Test API endpoint directly

### Setup Test Won't Connect to Database
1. Check MySQL is running
2. Verify the non-root database user and password are configured in server-side environment variables
3. Verify database name: `mr_sprinkle_db`
4. Create database if not exists

### API Endpoint Returns Error
1. Verify file exists at: `ambassador-backend.php`
2. Check PHP error logs
3. Verify database connection string in file
4. Test with different ambassador code (if available)

---

## 📞 Important Information

- **GitHub Repo:** https://github.com/WETTENTLLC/mr.sprinkle
- **Live Site:** https://mrsprinklereno.com
- **Testing Script:** https://mrsprinklereno.com/ambassador-system-setup-test.php
- **Portal URL:** https://mrsprinklereno.com/ambassador-portal.html
- **the ambassador's Code:** <ambassador-code>
- **the ambassador's Email:** ambassador@example.com
- **the ambassador's Phone:** (555) 010-0000

---

## ✨ Timeline

| Status | Item | Details |
|--------|------|---------|
| ✅ | Code Updated | All ambassador system files fixed |
| ✅ | Pushed to GitHub | All changes in master branch |
| 🔄 | Deploy to Production | Pull latest code on live server |
| 🔄 | Run Tests | Execute setup test script |
| 🔄 | Verify Login | Test the ambassador's credentials |
| 🔄 | Go Live | System ready for use |

---

## 🎉 Once All Tests Pass

sample ambassador is fully set up and can:
- ✅ Log into ambassador portal anytime
- ✅ See her unique referral link with code <ambassador-code>
- ✅ Track referrals and earnings
- ✅ View commission tier benefits
- ✅ Share QR code and referral link with friends
- ✅ Monitor her dashboard statistics

---

**README:** Read AMBASSADOR-TESTING-GUIDE.md for detailed step-by-step instructions
