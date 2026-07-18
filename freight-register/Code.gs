// Al Serawan Group — Freight Partner Registration
// Google Apps Script — Paste in Extensions > Apps Script > Code.gs
// Then: Deploy > New deployment > Web app > Anyone > Deploy

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = e.parameter;

    // ── Google Drive folder ──────────────────────────────────────
    var ROOT_FOLDER_NAME = 'Freight Partner Applications';
    var rootFolder = DriveApp.getFoldersByName(ROOT_FOLDER_NAME).hasNext()
      ? DriveApp.getFoldersByName(ROOT_FOLDER_NAME).next()
      : DriveApp.createFolder(ROOT_FOLDER_NAME);

    var companyName   = (data.company_name || 'Unknown').replace(/[\/\\:*?"<>|]/g, '-');
    var stamp         = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    var companyFolder = rootFolder.createFolder(companyName + ' (' + stamp + ')');
    companyFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // ── Helper: decode base64 → Drive file ──────────────────────
    function saveFile(b64, fileName) {
      if (!b64 || !fileName) return '';
      try {
        var decoded = Utilities.base64Decode(b64);
        var blob    = Utilities.newBlob(decoded, 'application/pdf', fileName);
        var file    = companyFolder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch (err) {
        return 'Upload error: ' + err.message;
      }
    }

    var crUrl        = saveFile(data.file_cr_b64,        data.file_cr_name);
    var logoUrl      = saveFile(data.file_logo_b64,      data.file_logo_name);
    var profileUrl   = saveFile(data.file_profile_b64,   data.file_profile_name);
    var warehouseUrl = saveFile(data.file_warehouse_b64, data.file_warehouse_name);

    // ── Headers on first row ─────────────────────────────────────
    if (sheet.getLastRow() === 0) {
      var headers = [
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
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
           .setFontWeight('bold')
           .setBackground('#1d00f4')
           .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // ── Data row ─────────────────────────────────────────────────
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
      crUrl,
      logoUrl,
      profileUrl,
      warehouseUrl,
      companyFolder.getUrl()
    ];

    sheet.appendRow(row);
    sheet.autoResizeColumns(1, sheet.getLastColumn());

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
