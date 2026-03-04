# Ambassador System - Complete Testing & Deployment Guide

## ✅ Status Update
All code changes have been pushed to GitHub and are ready for production deployment.

**GitHub Commits:**
- `9aaaab1` - Ambassador portal auth fixes and database validation
- `473b7e7` - Comprehensive testing and setup automation

---

## 🚀 Step 1: Deploy to Production Server

On your live server at https://mrsprinklereno.com, run:

```bash
git pull origin master
```

This pulls:
- ✓ Updated `ambassador-portal.html` (with database validation)
- ✓ Updated `ambassador-backend.php` (with proper routing)
- ✓ Updated `ambassador-new.html` (with localStorage tracking)
- ✓ Updated `business-admin.php` (with correct portal URL)
- ✓ `ambassador-system-setup-test.php` (testing tool)

---

## 🧪 Step 2: Run System Tests

After deployment, access the testing script at:

```
https://mrsprinklereno.com/ambassador-system-setup-test.php
```

This script will:

1. **✓ Test Database Connection**
   - Verify MySQL connection to `mr_sprinkle_db`
   - Confirm `ambassadors` table exists
   - Display database schema

2. **✓ Add/Update Natalia Chacon**
   - Code: `NATALIA09`
   - Email: `nataliachacon0904@gmail.com`
   - Phone: `775-250-9356`
   - Status: `active`

3. **✓ Test Backend Authentication**
   - Query database for NATALIA09
   - Verify ambassador record retrieval
   - Test API response format

4. **✓ List All Ambassadors**
   - Shows complete ambassador database
   - Verifies Natalia is properly added

---

## 🔐 Step 3: Verify Portal Login Works

Once tests pass, test the actual login:

1. Visit: https://mrsprinklereno.com/ambassador-portal.html
2. Enter Code: `NATALIA09`
3. Click Login

**Expected Results:**
```
✓ Dashboard loads
✓ Shows "Welcome, Natalia Chacon!"
✓ Displays referral link with NATALIA09
✓ Shows commission structure
✓ Displays stats (may be 0 initially)
✓ Shows QR code and share options
```

---

## 🔧 Step 4: Test Backend API Directly

If portal login fails, test the API directly:

```
https://mrsprinklereno.com/ambassador-backend.php?endpoint=ambassador-stats&code=NATALIA09
```

**Expected Response (JSON):**
```json
{
  "success": true,
  "data": {
    "ambassador_code": "NATALIA09",
    "name": "Natalia Chacon",
    "email": "nataliachacon0904@gmail.com",
    "phone": "775-250-9356",
    "status": "active",
    "total_referrals": 0,
    "paid_commission": 0,
    "pending_commission": 0
  }
}
```

---

## 📋 System Components Being Tested

| Component | File | Purpose | Test Method |
|-----------|------|---------|------------|
| Frontend Login | `ambassador-portal.html` | Ambassador login interface | Browser test at portal URL |
| Backend API | `ambassador-backend.php` | Database query endpoint | API test with query string |
| Database | `mr_sprinkle_db.ambassadors` | Ambassador records | Setup test script queries |
| Signup Form | `ambassador-new.html` | New ambassador signups | Visual check + localStorage |
| Admin Panel | `business-admin.php` | Manual ambassador approval | Visual check of URL |

---

## ✨ Natalia's Login Flow

```
1. Natalia visits https://mrsprinklereno.com/ambassador-portal.html
2. Enters code: NATALIA09
3. Portal sends fetch request to ambassador-backend.php
4. Backend queries database for NATALIA09
5. Database returns ambassador record
6. Portal displays dashboard with her info
7. She can see referral link and commission stats
```

---

## ⚠️ Troubleshooting

### Issue: "Invalid ambassador code" error
**Solution:**
1. Verify setup test script shows Natalia in database
2. Check that portal.html was updated (git pull successful)
3. Verify ambassador-backend.php exists on server
4. Check database has NATALIA09 record

### Issue: Database connection fails in setup test
**Solution:**
1. Verify MySQL is running
2. Check database credentials: `root` / (empty password)
3. Verify database name: `mr_sprinkle_db`
4. Check that ambassadors table exists

### Issue: API returns "not found"
**Solution:**
1. Run setup test to add Natalia
2. Verify email is `nataliachacon0904@gmail.com` (not 0903)
3. Verify code is exactly `NATALIA09`

---

## 📊 Database Verification

The setup test verifies:
- ✓ MySQL connection working
- ✓ `mr_sprinkle_db` database exists
- ✓ `ambassadors` table has correct schema
- ✓ Natalia record exists with correct email
- ✓ Backend can query and return ambassador data

---

## 🎯 Success Criteria

System is ready when:
- [ ] `git pull origin master` completes successfully
- [ ] https://mrsprinklereno.com/ambassador-system-setup-test.php runs without errors
- [ ] Test script shows "Database Connected Successfully"
- [ ] Test script shows Natalia Chacon in ambassador list
- [ ] https://mrsprinklereno.com/ambassador-portal.html loads
- [ ] Natalia can login with code NATALIA09
- [ ] Dashboard displays her information
- [ ] API endpoint returns JSON with ambassador data

---

## 📞 Support

If any step fails:
1. Check error messages in setup test script
2. Verify all files were deployed (git pull)
3. Confirm MySQL credentials
4. Test API endpoint directly
5. Review ambassador-backend.php for connection issues

---

## 🎉 Once Complete

Natalia is fully set up and can:
- ✓ Access her ambassador dashboard
- ✓ Get unique referral link with code
- ✓ Track referrals and earnings
- ✓ Monitor commission tiers
- ✓ Share QR code and referral link
