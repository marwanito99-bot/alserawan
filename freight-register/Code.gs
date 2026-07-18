// Al Serawan Group — Freight Partner Registration
// Google Apps Script
// Extensions > Apps Script > Code.gs > Deploy > New deployment > Web app > Anyone > Deploy

function doPost(e) {

  // ── 1. Parse POST body ───────────────────────────────────────────
  // URLSearchParams sends application/x-www-form-urlencoded
  // For large payloads (base64 files), e.parameter can be truncated — read raw body instead
  var data = {};

  try {
    if (e.postData && e.postData.contents) {
      e.postData.contents.split('&').forEach(function(pair) {
        var eqIdx = pair.indexOf('=');
        if (eqIdx < 0) return;
        var k = decodeURIComponent(pair.substring(0, eqIdx).replace(/\+/g, ' '));
        var v = decodeURIComponent(pair.substring(eqIdx + 1).replace(/\+/g, ' '));
        data[k] = v;
      });
    }
  } catch(parseErr) {
    Logger.log('postData parse error: ' + parseErr);
  }

  // Fill any keys missing from postData parse using e.parameter
  if (e.parameter) {
    for (var pk in e.parameter) {
      if (!data[pk]) data[pk] = e.parameter[pk];
    }
  }

  // ── 2. Get sheet ─────────────────────────────────────────────────
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // ── 3. Add headers on first use ──────────────────────────────────
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

  if (sheet.getLastRow() === 0) {
    // Fresh sheet — write all headers
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setFontWeight('bold')
         .setBackground('#1d00f4')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } else {
    // Sheet already has headers — check if Drive URL columns are missing and add them
    var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var lastExisting = existingHeaders.length;
    if (lastExisting < HEADERS.length) {
      var missingHeaders = HEADERS.slice(lastExisting);
      sheet.getRange(1, lastExisting + 1, 1, missingHeaders.length)
           .setValues([missingHeaders])
           .setFontWeight('bold')
           .setBackground('#1d00f4')
           .setFontColor('#ffffff');
    }
  }

  // ── 4. Build & save text row FIRST ──────────────────────────────
  // This runs BEFORE Drive — so even if Drive permissions are missing, text data is saved
  var companyName = (data.company_name || 'Unknown').replace(/[\/\\:*?"<>|]/g, '-');

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
    data.position !== 'Other' ? (data.position || '') : (data.position_other || ''),
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
    '', '', '', '', ''   // Drive URLs — updated below if Drive succeeds
  ];

  sheet.appendRow(row);
  var savedRowNum = sheet.getLastRow();
  sheet.autoResizeColumns(1, sheet.getLastColumn());

  // ── 5. Google Drive file saving (separate try — won't break Sheet save) ──
  try {
    var ROOT_FOLDER_NAME = 'Freight Partner Applications';
    var rootFolder = DriveApp.getFoldersByName(ROOT_FOLDER_NAME).hasNext()
      ? DriveApp.getFoldersByName(ROOT_FOLDER_NAME).next()
      : DriveApp.createFolder(ROOT_FOLDER_NAME);

    var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    var companyFolder = rootFolder.createFolder(companyName + ' (' + stamp + ')');
    companyFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    function saveFile(b64, fileName) {
      if (!b64 || !fileName) return '';
      try {
        var decoded = Utilities.base64Decode(b64);
        var blob    = Utilities.newBlob(decoded, 'application/pdf', fileName);
        var file    = companyFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch(fileErr) {
        Logger.log('File save error: ' + fileErr);
        return 'upload-error';
      }
    }

    var crUrl        = saveFile(data.file_cr_b64,        data.file_cr_name);
    var logoUrl      = saveFile(data.file_logo_b64,      data.file_logo_name);
    var profileUrl   = saveFile(data.file_profile_b64,   data.file_profile_name);
    var warehouseUrl = saveFile(data.file_warehouse_b64, data.file_warehouse_name);
    var folderUrl    = companyFolder.getUrl();

    // HEADERS.length = 73 → Drive columns start at col 69 (1-indexed in Sheets)
    var driveColStart = HEADERS.length - 4;
    sheet.getRange(savedRowNum, driveColStart, 1, 5)
         .setValues([[crUrl, logoUrl, profileUrl, warehouseUrl, folderUrl]]);

  } catch(driveErr) {
    // Drive permission not yet granted — text data is already safely in the Sheet
    Logger.log('Drive error (text data already saved): ' + driveErr.toString());
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
