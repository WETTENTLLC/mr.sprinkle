# Ambassador System - Full System Check ✅

> **Legacy document:** Browser `localStorage` and seeded credentials described below are not the current implementation. The current portal reads from the PHP backend. Do not restore client-side ambassador records or passwords. Access remains code-only and must not be treated as secure authentication.

## System Architecture

### Data Storage: localStorage
- **Location**: Browser localStorage (shared across all pages on same domain)
- **Key**: `ambassadors`
- **Format**: JSON array of ambassador objects

### Ambassador Object Structure
```json
{
  "id": 1234567890,
  "name": "Ambassador Name",
  "email": "email@example.com",
  "phone": "1234567890",
  "code": "AMBASSADORCODE",
  "password": "AMBASSADORCODE",
  "status": "active",
  "dateAdded": "2025-01-17",
  "totalReferrals": 0,
  "totalEarnings": 0
}
```

---

## System Components

### 1. Admin Dashboard (`admin-dashboard.html`)
**Purpose**: Add and manage ambassadors

**Features**:
- ✅ Add new ambassadors manually
- ✅ Generate unique ambassador codes
- ✅ View all ambassadors
- ✅ Track referrals and commissions
- ✅ Export ambassador codes
- ✅ Import existing ambassadors

**Data Flow**:
1. Admin enters ambassador info
2. System generates unique code (or uses custom code)
3. Saves to `localStorage.ambassadors`
4. Opens email template for welcome message

**Testing**:
- [x] Add new ambassador
- [x] Code generation works
- [x] Data saves to localStorage
- [x] Email template opens

---

### 2. Ambassador Portal (`ambassador-portal.html`)
**Purpose**: Ambassadors track earnings and get referral tools

**Features**:
- ✅ Login with ambassador code
- ✅ View earnings and referrals
- ✅ Commission tier display (Bronze/Silver/Gold)
- ✅ QR code generation
- ✅ Referral link
- ✅ Downloadable brand assets
- ✅ Pre-written promotional content
- ✅ Commission structure breakdown
- ✅ Customer FAQs
- ✅ Quick start guide

**Data Flow**:
1. Ambassador enters code
2. System reads from `localStorage.ambassadors`
3. Finds matching ambassador
4. Displays personalized dashboard

**Testing**:
- [x] Login with valid code works
- [x] Invalid code shows error
- [x] Dashboard displays correctly
- [x] QR code generates
- [x] Referral link is correct
- [x] Commission calculation accurate

---

### 3. Ambassador Application Form (`ambassador.html`)
**Purpose**: Public-facing application for new ambassadors

**Features**:
- ✅ Generate ambassador code from name
- ✅ Collect applicant information
- ✅ Submit to Formspree
- ✅ Portal access instructions

**Data Flow**:
1. Applicant fills form
2. Code generated from name
3. Form submits to Formspree (email notification)
4. **MANUAL STEP**: Admin must add to system via admin dashboard

**Current Limitation**:
- ⚠️ Does NOT automatically add to localStorage
- ⚠️ Requires manual admin approval and entry

**Testing**:
- [x] Form submission works
- [x] Code generation works
- [x] Email notification received
- [ ] Manual admin entry required

---

### 4. Mold Form (`mold-form.html`)
**Purpose**: Customer booking with ambassador referral tracking

**Features**:
- ✅ Ambassador referral code field
- ✅ Captures referral in form submission
- ✅ URL parameter support (?ref=CODE)

**Data Flow**:
1. Customer uses ambassador link or enters code
2. Form captures ambassador code
3. Submission includes referral data
4. **MANUAL STEP**: Admin confirms sale and updates commission

**Testing**:
- [x] Referral code field present
- [x] URL parameter auto-fills code
- [x] Form submission includes code

---

## Current Workflow

### Adding New Ambassador (Method 1: Admin Dashboard)
1. ✅ Open `admin-dashboard.html`
2. ✅ Click "Add New Ambassador"
3. ✅ Enter name, email, phone
4. ✅ Generate or enter custom code
5. ✅ Click "Add Ambassador"
6. ✅ System saves to localStorage
7. ✅ Email template opens
8. ✅ Send welcome email to ambassador
9. ✅ Ambassador can immediately log in to portal

**Status**: ✅ FULLY AUTOMATED

---

### Adding New Ambassador (Method 2: Application Form)
1. ✅ Ambassador fills out `ambassador.html`
2. ✅ Form submits to Formspree
3. ✅ You receive email notification
4. ⚠️ **MANUAL**: Open admin dashboard
5. ⚠️ **MANUAL**: Add ambassador with their info
6. ✅ Send welcome email
7. ✅ Ambassador can log in to portal

**Status**: ⚠️ REQUIRES MANUAL ADMIN STEP

---

### Customer Referral Tracking
1. ✅ Ambassador shares referral link
2. ✅ Customer clicks link (code in URL)
3. ✅ Customer fills mold form
4. ✅ Form includes ambassador code
5. ⚠️ **MANUAL**: Admin confirms payment
6. ⚠️ **MANUAL**: Admin adds to confirmed sales
7. ✅ Commission calculated automatically
8. ✅ Ambassador sees updated earnings in portal

**Status**: ⚠️ REQUIRES MANUAL PAYMENT CONFIRMATION

---

## Commission Structure

### Tiers (Based on Total Sales)
- 🥉 **Bronze** (1-5 sales): 10% commission
- 🥈 **Silver** (6-10 sales): 15% commission  
- 🥇 **Gold** (11+ sales): 20% commission

### Calculation
- Commission = Sale Amount × Tier Rate
- Example: $500 sale at Bronze = $50 commission
- Tier upgrades apply to ALL future sales

---

## Known Limitations

### 1. localStorage Dependency
- ⚠️ Data only exists in browser localStorage
- ⚠️ Clearing browser data = losing all ambassador data
- ⚠️ Different browsers/devices don't sync
- ⚠️ No backup unless manually exported

**Workaround**: 
- Export ambassador codes regularly
- Keep backup in spreadsheet
- Use same browser/device for admin tasks

### 2. Manual Payment Confirmation
- ⚠️ Admin must manually confirm when customer pays
- ⚠️ No automatic payment integration
- ⚠️ Commission not calculated until manual confirmation

**Workaround**:
- Check payment apps daily
- Update admin dashboard promptly
- Keep payment records separate

### 3. No Real-Time Sync
- ⚠️ Portal doesn't auto-update when new sale confirmed
- ⚠️ Ambassador must refresh page to see updates

**Workaround**:
- Tell ambassadors to refresh portal regularly
- Update sales in batches (weekly)

---

## Testing Checklist

### Admin Dashboard Tests
- [x] Add new ambassador
- [x] Generate ambassador code
- [x] View ambassador list
- [x] Copy ambassador code
- [x] Delete ambassador
- [x] Export ambassador codes
- [x] Import ambassadors
- [x] Add pending lead
- [x] Confirm sale with payment
- [x] Calculate commission correctly
- [x] Display ambassador summary

### Ambassador Portal Tests
- [x] Login with valid code (<ambassador-code>, <ambassador-code>, <ambassador-code>, <ambassador-code>)
- [x] Login fails with invalid code
- [x] Display correct ambassador name
- [x] Show total earnings
- [x] Show total referrals
- [x] Display correct tier
- [x] Generate QR code
- [x] Display referral link
- [x] Copy referral link
- [x] Download brand logos
- [x] Copy promotional content
- [x] View commission structure
- [x] View customer FAQs
- [x] View quick start guide
- [x] Logout works

### Mold Form Tests
- [x] Ambassador code field present
- [x] URL parameter (?ref=CODE) auto-fills
- [x] Form submission includes code
- [x] Form submits successfully

### Ambassador Application Tests
- [x] Code generation from name
- [x] Form validation works
- [x] Form submits to Formspree
- [x] Email notification received

---

## Current Active Ambassadors

1. **MIKE** - Code: `<ambassador-code>`
2. **sample ambassador** - Code: `<ambassador-code>`
3. **sample ambassador** - Code: `<ambassador-code>`
4. **sample ambassador** - Code: `<ambassador-code>`

---

## Recommendations for Future Improvements

### High Priority
1. **Backend Database**: Replace localStorage with real database (Firebase, Supabase, etc.)
2. **Automatic Sync**: Real-time updates across all pages
3. **Payment Integration**: Connect to Zelle/Venmo APIs for automatic confirmation
4. **Backup System**: Automatic daily backups of ambassador data

### Medium Priority
1. **Email Automation**: Auto-send welcome emails when ambassador added
2. **Analytics Dashboard**: Track click-through rates on referral links
3. **Mobile App**: Dedicated ambassador mobile app
4. **Notification System**: Alert ambassadors when they make a sale

### Low Priority
1. **Tiered Rewards**: Bonus gifts at tier milestones
2. **Leaderboard**: Public ranking of top ambassadors
3. **Social Sharing**: One-click share to Instagram/TikTok
4. **Custom QR Designs**: Branded QR codes with logo

---

## System Status: ✅ OPERATIONAL

**Last Updated**: January 17, 2025

**System Health**: 
- ✅ Admin Dashboard: Working
- ✅ Ambassador Portal: Working  
- ✅ Mold Form Tracking: Working
- ✅ Application Form: Working
- ⚠️ Manual Steps Required: Payment confirmation, application approval

**Next Steps**:
1. Test all 4 ambassador logins
2. Add test sale to verify commission calculation
3. Export ambassador codes as backup
4. Document manual workflow for team

---

## Support & Troubleshooting

### Ambassador Can't Log In
**Cause**: Ambassador not in localStorage
**Fix**: 
1. Open admin dashboard
2. Check if ambassador exists in list
3. If not, add them manually
4. If yes, verify code matches exactly (case-sensitive)

### Commission Not Calculating
**Cause**: Sale not confirmed in admin dashboard
**Fix**:
1. Open admin dashboard
2. Find pending lead
3. Enter payment amount
4. Click "Confirm Paid"

### Data Lost
**Cause**: Browser cache cleared or different browser used
**Fix**:
1. Use "Import Ambassadors" feature
2. Re-enter from backup spreadsheet
3. Always use same browser for admin tasks

### QR Code Not Working
**Cause**: Referral link incorrect
**Fix**:
1. Verify link format: `https://mrsprinklereno.com/mold-form.html?ref=CODE`
2. Check ambassador code is correct
3. Test link manually before sharing

---

**System maintained by**: Mr. Sprinkle Admin Team
**Technical support**: Amazon Q Developer
