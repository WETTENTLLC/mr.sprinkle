// Mr. Sprinkle - Google Apps Script
// Paste this into Extensions > Apps Script in your Google Sheet

const SHEET_ID = '1p6ExixIYy7CkMu_8nZTIq2kUUZf-lmn_a4fro-rPUGQ';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (data.form_type === 'ambassador_application') {
      const sheet = ss.getSheetByName('Ambassadors');
      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Date','Name','Email','Phone','Instagram','Code','Style','Location','Status']);
      }
      sheet.appendRow([
        new Date().toLocaleDateString(),
        data.name || '',
        data.email || '',
        data.phone || '',
        data.instagram || '',
        data.ambassador_code || '',
        data.grillz_style || '',
        data.location || '',
        'pending'
      ]);

    } else if (data.form_type === 'mold_order') {
      const sheet = ss.getSheetByName('Orders');
      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Date','Customer','Email','Phone','Teeth','Material','Budget','Payment','Ambassador Code','Rush','Promo Code','Design']);
      }
      sheet.appendRow([
        new Date().toLocaleDateString(),
        data.customer_name || '',
        data.email || '',
        data.phone || '',
        data.selected_teeth || '',
        data.material || '',
        data.budget || '',
        data.payment_method || '',
        data.ambassador_code || '',
        data.rush_delivery || '',
        data.promo_code || '',
        data.design || ''
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function - run this manually to verify sheet connection
function testConnection() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const ambSheet = ss.getSheetByName('Ambassadors');
  const ordSheet = ss.getSheetByName('Orders');
  Logger.log('Ambassadors sheet: ' + (ambSheet ? 'Found ✅' : 'NOT FOUND ❌'));
  Logger.log('Orders sheet: ' + (ordSheet ? 'Found ✅' : 'NOT FOUND ❌'));
}
