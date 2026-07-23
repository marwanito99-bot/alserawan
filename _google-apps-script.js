// ============================================================
//  MWM Logistics — Google Apps Script
//  Handles: Sourcing Requests + Supplier Registrations
//  Each form writes to its own Google Sheet
// ============================================================

var CONFIG = {

  sourcing_request: {
    spreadsheetId: '1IR7X0_oa4MPoekIJ-loRLKE-n1pbOIQjzzO7-q9-rdM',
    sheetName: 'Sheet1',
    headers: [
      'Timestamp',
      'Company Name', 'Country', 'City', 'Business Type', 'Website',
      'Contact Name', 'Position', 'WhatsApp', 'Email', 'Preferred Contact',
      'Product Category', 'Product Description', 'Quantity', 'Unit',
      'Target Price', 'Total Budget', 'Repeat Order',
      'Destination', 'Shipping Method', 'Incoterms', 'Timeframe', 'Need Inspection',
      'Notes', 'Referral'
    ],
    fields: [
      'timestamp',
      'company_name', 'country', 'city', 'business_type', 'website',
      'contact_name', 'position', 'whatsapp', 'email', 'contact_method',
      'product_category', 'product_description', 'quantity', 'unit',
      'target_price', 'total_budget', 'repeat_order',
      'destination', 'shipping_method', 'incoterms', 'timeframe', 'need_inspection',
      'notes', 'referral'
    ]
  },

  supplier_registration: {
    spreadsheetId: '1uot_nQ1qNPoE6b3loYyahbZTx5o-fEue5X-mmp_EeoQ',
    sheetName: 'Sheet1',
    headers: [
      'Timestamp',
      'Company Name', 'Country', 'City', 'Year Founded', 'Business Type', 'Website', 'Address',
      'Contact Name', 'Position', 'WhatsApp', 'Email', 'WeChat', 'Languages',
      'Product Category', 'Product Details', 'Monthly Capacity', 'MOQ', 'Employees', 'Lead Time', 'OEM',
      'Has Certifications', 'Certification Names', 'Exports', 'Export Markets', 'Export Docs', 'Payment Terms',
      'Why Work With Us'
    ],
    fields: [
      'timestamp',
      'company_name', 'country', 'city', 'year_founded', 'business_type', 'website', 'address',
      'contact_name', 'position', 'whatsapp', 'email', 'wechat', 'languages',
      'product_category', 'product_details', 'capacity', 'moq', 'employees', 'lead_time', 'oem',
      'has_certs', 'cert_names', 'exports', 'export_markets', 'export_docs', 'payment_terms',
      'differentiator'
    ]
  }

};

// ============================================================
//  MAIN — called automatically on every form submission
// ============================================================

function doPost(e) {
  try {
    // 1. Parse incoming data
    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (x) {
      data = e.parameter || {};
    }

    // 2. Add server-side timestamp
    data['timestamp'] = Utilities.formatDate(
      new Date(), 'Asia/Riyadh', 'yyyy-MM-dd HH:mm:ss'
    );

    // 3. Find the right config
    var formType = data['form_type'] || '';
    var cfg = CONFIG[formType];

    if (!cfg) {
      return respond({ status: 'error', message: 'Unknown form_type: ' + formType });
    }

    // 4. Open the sheet
    var ss    = SpreadsheetApp.openById(cfg.spreadsheetId);
    var sheet = ss.getSheetByName(cfg.sheetName);
    if (!sheet) sheet = ss.getSheets()[0]; // fallback to first tab

    // 5. Write header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(cfg.headers);
      var headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
      headerRange.setFontWeight('bold')
                 .setBackground('#1d00f4')
                 .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // 6. Build data row in the same order as headers
    var row = cfg.fields.map(function(field) {
      return data[field] || '';
    });

    // 7. Write the row
    sheet.appendRow(row);

    // 8. Auto-resize columns (only first few submissions to save quota)
    if (sheet.getLastRow() <= 3) {
      sheet.autoResizeColumns(1, cfg.headers.length);
    }

    return respond({ status: 'ok', form_type: formType });

  } catch (err) {
    return respond({ status: 'error', message: err.toString() });
  }
}

// ============================================================
//  Health check — visit the URL in browser to test
// ============================================================

function doGet(e) {
  return respond({ status: 'ok', message: 'MWM Script is running' });
}

// ============================================================
//  Helper
// ============================================================

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
