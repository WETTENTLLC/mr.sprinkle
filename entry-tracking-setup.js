// SETUP INSTRUCTIONS FOR GOOGLE SHEETS ENTRY TRACKING
// ====================================================

// 1. CREATE GOOGLE SHEET:
//    - Go to sheets.google.com
//    - Create new sheet named "Tax Time Entries"
//    - Column headers: Timestamp | Name | Email | Phone | Entry Type | Amount | PayPal Transaction ID

// 2. SETUP GOOGLE APPS SCRIPT:
//    - In your sheet: Extensions > Apps Script
//    - Paste the code below:

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.name || 'N/A',
    data.email || 'N/A',
    data.phone || 'N/A',
    data.type, // 'paid' or 'free'
    data.amount || '0',
    data.txn_id || 'N/A'
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var count = sheet.getLastRow() - 1; // Subtract header row
  return ContentService.createTextOutput(JSON.stringify({count: count}))
    .setMimeType(ContentService.MimeType.JSON);
}

// 3. DEPLOY:
//    - Click "Deploy" > "New deployment"
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
//    - Copy the Web App URL

// 4. UPDATE tax-time-promo.html:
//    - Replace GOOGLE_SCRIPT_URL with your deployed URL
//    - Line 234: const GOOGLE_SCRIPT_URL = 'YOUR_URL_HERE';

// 5. PAYPAL IPN (OPTIONAL - Advanced):
//    - PayPal Dashboard > Account Settings > Notifications > Instant Payment Notifications
//    - Set Notification URL to your Google Script URL
//    - This auto-logs paid entries when PayPal confirms payment
