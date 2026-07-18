// Al Serawan Group — Freight Partner Registration
// Google Apps Script — bound to the Freight Partner Applications spreadsheet
// Extensions > Apps Script > Code.gs > Deploy > New deployment > Web app > Anyone > Deploy

var SHEET_ID = '1ZpX143c5awE9Reg541MLzWITAym6axUKfLPGdZVUmJ8';
var ROOT_FOLDER_NAME = 'Freight Partner Applications';

var HEADERS = [
  'Timestamp','Company Name','Brand Name','Year Founded','City',
  'Countries','Office Address','Website','Social Media',
  'Contact Name','Position','WhatsApp','Phone 2','Email','Is Owner',
  'Has CR','CR Number','CR Date','Tax Number','Intl Licensed',
  'Shipping Lines','Has Agency','Agency Name',
  'Has Certs','Cert Names','Has Network','Network Name',
  'Shipping Scope','Ship From','Ship To','Shipping Types',
  'Has Warehouse','Warehouse Address',
  'Has Vehicles','Vehicle Types','Vehicle Count',
  'Employees','Branches Local','Branches Intl','Additional Services',
  'Cargo Types','Cargo Other','Weight Min','Weight Max',
  'Volume Min','Volume Max',
  'Pricing Type','Pricing Mechanism','Has Insurance',
  'Has Compensation','Compensation Policy',
  'Payment Methods','Currencies','Deferred Payment',
  'Has Tracking','Has App','24/7 Support','Languages',
  'Monthly Shipments','Max Capacity',
  'Delivery Domestic','Delivery Intl','Working Days','Working Hours',
  'Differentiator','Appear on Platform','Accept Referrals','Referral Pricing',
  'CR File (Drive)','Logo File (Drive)','Profile File (Drive)','Warehouse File (Drive)',
  'Company Folder (Drive)'
];

// ── Test functions (run manually from editor) ─────────────────────

function testSheetAccess() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    Logger.log('✅ Sheet: ' + sheet.getName() + ' | Rows: ' + sheet.getLastRow());
    sheet.appendRow(['✅ TEST ROW — delete me', new Date()]);
    Logger.log('✅ Row written OK');
  } catch(err) { Logger.log('❌ ' + err); }
}

function testDriveAccess() {
  try {
    var f = DriveApp.createFolder('_TEST_DELETE_ME_');
    Logger.log('✅ Drive OK: ' + f.getUrl());
    f.setTrashed(true);
  } catch(err) { Logger.log('❌ ' + err); }
}

// ── Main entry point ──────────────────────────────────────────────

function doPost(e) {
  try {
    var contentType = (e.postData && e.postData.type) ? e.postData.type : '';

    // Route: JSON file upload (text/plain body from fetch)
    if (contentType.indexOf('text/plain') !== -1) {
      return handleFiles(e);
    }

    // Route: URL-encoded form submission (text data)
    return handleForm(e);

  } catch(err) {
    Logger.log('doPost error: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({result:'error',error:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Handle text form data ─────────────────────────────────────────

function handleForm(e) {
  // Parse URL-encoded body
  var data = {};
  try {
    if (e.postData && e.postData.contents) {
      e.postData.contents.split('&').forEach(function(pair) {
        var idx = pair.indexOf('=');
        if (idx < 0) return;
        var k = decodeURIComponent(pair.substring(0, idx).replace(/\+/g, ' '));
        var v = decodeURIComponent(pair.substring(idx + 1).replace(/\+/g, ' '));
        data[k] = v;
      });
    }
  } catch(parseErr) { Logger.log('parse error: ' + parseErr); }

  if (e.parameter) {
    for (var pk in e.parameter) { if (!data[pk]) data[pk] = e.parameter[pk]; }
  }

  var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

  // Add / fix headers
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#1d00f4').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } else {
    var existing = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    if (existing.length < HEADERS.length) {
      var missing = HEADERS.slice(existing.length);
      sheet.getRange(1, existing.length+1, 1, missing.length)
           .setValues([missing]).setFontWeight('bold').setBackground('#1d00f4').setFontColor('#ffffff');
    }
  }

  var row = [
    new Date(),
    data.company_name        || '',
    data.brand_name          || '',
    data.year_founded        || '',
    data.city                || '',
    data['country[]']        || '',
    data.office_address      || '',
    data.website             || '',
    data['social[]']         || '',
    data.contact_name        || '',
    data.position !== 'Other' ? (data.position||'') : (data.position_other||''),
    data.whatsapp            || '',
    data.phone2              || '',
    data.email               || '',
    data.is_owner            || '',
    data.has_cr              || '',
    data.cr_number           || '',
    data.cr_date             || '',
    data.tax_number          || '',
    data.intl_licensed       || '',
    data.shipping_lines      || '',
    data.has_agency          || '',
    data.agency_name         || '',
    data.has_certs           || '',
    data.cert_names          || '',
    data.has_network         || '',
    data.network_name        || '',
    data.shipping_scope      || '',
    data.ship_from           || '',
    data.ship_to             || '',
    data.shipping_types      || '',
    data.has_warehouse       || '',
    data.warehouse_address   || '',
    data.has_vehicles        || '',
    data.vehicle_types       || '',
    data.vehicle_count       || '',
    data.employee_count      || '',
    data.branches_local      || '',
    data.branches_intl       || '',
    data.add_services        || '',
    data.cargo_types         || '',
    data.cargo_other         || '',
    data.weight_min          || '',
    data.weight_max          || '',
    data.volume_min          || '',
    data.volume_max          || '',
    data.pricing_type        || '',
    data.pricing_mechanism   || '',
    data.has_insurance       || '',
    data.has_compensation    || '',
    data.compensation_policy || '',
    data.payment_methods     || '',
    data.currencies          || '',
    data.deferred_payment    || '',
    data.has_tracking        || '',
    data.has_app             || '',
    data.support_24          || '',
    data.languages           || '',
    data.monthly_shipments   || '',
    data.max_capacity        || '',
    data.delivery_domestic   || '',
    data.delivery_intl       || '',
    data.working_days        || '',
    data.working_hours       || '',
    data.differentiator      || '',
    data.appear_platform     || '',
    data.accept_referrals    || '',
    data.referral_pricing    || '',
    '','','','',''
  ];

  sheet.appendRow(row);
  sheet.autoResizeColumns(1, sheet.getLastColumn());

  return ContentService
    .createTextOutput(JSON.stringify({result:'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Handle file upload (separate JSON request) ────────────────────

function handleFiles(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    Logger.log('handleFiles: company=' + payload.company + ' | email=' + payload.email);
    Logger.log('CR b64 length: ' + (payload.file_cr_b64 ? payload.file_cr_b64.length : 0));

    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    var lastRow = sheet.getLastRow();

    // Find the most recent row matching company or email
    var targetRow = -1;
    for (var i = lastRow; i >= 2; i--) {
      var rowCompany = sheet.getRange(i, 2).getValue();
      var rowEmail   = sheet.getRange(i, 14).getValue();
      if ((payload.company && rowCompany === payload.company) ||
          (payload.email   && rowEmail   === payload.email)) {
        targetRow = i;
        break;
      }
    }

    if (targetRow < 0) {
      Logger.log('No matching row found — using last row: ' + lastRow);
      targetRow = lastRow; // fallback: update the last row
    }

    // Create Drive folder
    var rootFolder = DriveApp.getFoldersByName(ROOT_FOLDER_NAME).hasNext()
      ? DriveApp.getFoldersByName(ROOT_FOLDER_NAME).next()
      : DriveApp.createFolder(ROOT_FOLDER_NAME);

    var companyName = (payload.company || 'Unknown').replace(/[\/\\:*?"<>|]/g,'-');
    var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    var folder = rootFolder.createFolder(companyName + ' (' + stamp + ')');
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    function saveFile(b64, fileName) {
      if (!b64 || !fileName) return '';
      try {
        var blob = Utilities.newBlob(Utilities.base64Decode(b64), 'application/pdf', fileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch(err) { Logger.log('saveFile error: ' + err); return ''; }
    }

    var crUrl  = saveFile(payload.file_cr_b64,        payload.file_cr_name);
    var lgUrl  = saveFile(payload.file_logo_b64,       payload.file_logo_name);
    var prUrl  = saveFile(payload.file_profile_b64,    payload.file_profile_name);
    var whUrl  = saveFile(payload.file_warehouse_b64,  payload.file_warehouse_name);
    var flUrl  = folder.getUrl();

    Logger.log('crUrl: ' + crUrl);

    // Update Drive URL columns (69–73)
    sheet.getRange(targetRow, HEADERS.length - 4, 1, 5)
         .setValues([[crUrl, lgUrl, prUrl, whUrl, flUrl]]);

  } catch(err) {
    Logger.log('handleFiles error: ' + err);
  }

  return ContentService
    .createTextOutput(JSON.stringify({result:'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
