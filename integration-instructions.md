# Ambassador Integration for Existing Forms

## Quick Integration Steps

### 1. Add to Existing HTML Pages
Add this script tag before closing `</body>`:
```html
<script src="ambassador-integration.js"></script>
```

### 2. Update Form Action
Change your existing form action to:
```html
<form action="form-handler.php" method="POST">
```

### 3. Ensure Form Fields
Make sure your forms have these field names:
- `customer_name` or `name`
- `customer_email` or `email` 
- `customer_phone` or `phone`
- `service_type` (optional)

### 4. Database Setup
Run the database-setup.sql file once to create required tables.

## That's It!
Your existing forms now support:
- ✅ Ambassador referral tracking
- ✅ Automatic 10% discounts
- ✅ Commission calculations
- ✅ Visit tracking

## Ambassador Links
Format: `https://yoursite.com/your-form.html?ref=AMBASSADORCODE`