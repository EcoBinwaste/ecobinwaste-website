/**
 * ECOBIN WASTE — BOOKING BACKEND (Google Apps Script + Google Sheets)
 * =====================================================================
 * Public booking API + private admin operations.
 *
 * Secrets are stored in Apps Script Script Properties, not in source code:
 *   ADMIN_KEY   = private dashboard password
 *   ADMIN_EMAIL = optional booking-alert email (falls back to the script owner)
 *
 * Configure these in Apps Script: Project Settings → Script Properties.
 * See SETUP-GUIDE.md.
 */

function getAdminConfig_() {
  const props = PropertiesService.getScriptProperties();
  const key = String(props.getProperty('ADMIN_KEY') || '').trim();
  const email = String(props.getProperty('ADMIN_EMAIL') || Session.getEffectiveUser().getEmail() || '').trim();
  return { key: key, email: email };
}

function requireAdminKey_(key) {
  const config = getAdminConfig_();
  if (!config.key) return jsonResponse({ success: false, error: 'Admin access is not configured. Set ADMIN_KEY in Apps Script Script Properties.' });
  if (key !== config.key) return jsonResponse({ success: false, error: 'Unauthorized — wrong admin key.' });
  return null;
}

const SHEET_NAME = 'Bookings';
const PHOTO_FOLDER_NAME = 'Ecobin Waste - Pickup Photos';
const HEADERS = [
  'Booking ID', 'Timestamp', 'Name', 'Phone', 'Email', 'Address', 'Area',
  'Waste Type', 'Quantity', 'Pickup Date', 'Pickup Time', 'Photo URLs', 'Status'
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'createBooking') return createBooking(body.payload);
    if (body.action === 'updateStatus') return updateStatus(body.payload);
    // 'list' lives here (POST), not in doGet, specifically so ADMIN_KEY is
    // never sent as a URL query parameter — URLs get logged by browsers,
    // proxies, and server access logs, but POST body contents generally don't.
    if (body.action === 'list') return listBookingsSecure(body);
    return jsonResponse({ success: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    // 'ping' is intentionally the only GET action, and intentionally has no
    // secret in it — it's just a reachability check, safe to be a plain URL.
    if (action === 'ping') {
      return jsonResponse({ success: true, message: 'Ecobin Waste booking backend is live.' });
    }
    return jsonResponse({ success: false, error: 'Unknown action, or this action requires POST.' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function listBookingsSecure(body) {
  const authError = requireAdminKey_(body && body.key);
  if (authError) return authError;
  return jsonResponse({ success: true, bookings: listBookings() });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function generateBookingId() {
  // PropertiesService persists independently of the Sheet — unlike counting
  // sheet.getLastRow(), this can't produce a duplicate ID just because
  // someone manually deleted a row from the Sheet later. The counter only
  // ever goes up. Six digits leaves ample room for long-term growth.
  const props = PropertiesService.getScriptProperties();
  const seq = (parseInt(props.getProperty('bookingSeq'), 10) || 0) + 1;
  props.setProperty('bookingSeq', String(seq));
  const today = new Date();
  const y = today.getFullYear();
  const m = ('0' + (today.getMonth() + 1)).slice(-2);
  const d = ('0' + today.getDate()).slice(-2);
  return 'ECO-' + y + m + d + '-' + ('000000' + seq).slice(-6);
}

function getOrCreatePhotoFolder() {
  const folders = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(PHOTO_FOLDER_NAME);
}

/**
 * Basic server-side validation + spam guard.
 * Rejects obviously bad submissions before they hit the sheet.
 */
function validatePayload(p) {
  if (!p || typeof p !== 'object') return 'Missing booking data.';

  function str(v){ return (typeof v === 'string' || typeof v === 'number') ? String(v).trim() : ''; }

  var name = str(p.name);
  if (!name || name.length < 2 || name.length > 100) return 'Name must be between 2 and 100 characters.';

  var phone = str(p.phone);
  if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) return 'Valid 10-digit phone number is required.';

  var email = str(p.email);
  if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return 'Email address looks invalid.';

  var address = str(p.address);
  if (!address || address.length < 5 || address.length > 300) return 'Address must be between 5 and 300 characters.';

  var area = str(p.area);
  if (!area || area.length > 100) return 'A valid area is required.';

  var wasteType = str(p.wasteType);
  if (!wasteType || wasteType.length > 300) return 'Waste type is required.';

  var quantity = str(p.quantity);
  if (!quantity || quantity.length > 100) return 'Quantity is required.';

  var pickupDateStr = str(p.pickupDate);
  var parsedDate = new Date(pickupDateStr);
  if (!pickupDateStr || isNaN(parsedDate.getTime())) return 'A valid pickup date is required.';
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);
  if (parsedDate.getTime() < today.getTime()) return 'Pickup date cannot be in the past.';

  var pickupTime = str(p.pickupTime);
  if (!pickupTime || pickupTime.length > 100) return 'Pickup time is required.';

  if (p.photos !== undefined && p.photos !== null) {
    if (!Array.isArray(p.photos)) return 'Photos must be a list.';
    if (p.photos.length > 3) return 'Too many photos (max 3) — matches the limit enforced in script.js.';
    var allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
    for (var i = 0; i < p.photos.length; i++) {
      var photo = p.photos[i];
      if (!photo || typeof photo !== 'object') return 'One or more photos are invalid.';
      if (!photo.data || typeof photo.data !== 'string') return 'One or more photos are invalid.';
      if (!photo.mimeType || allowedMime.indexOf(photo.mimeType) === -1) return 'Unsupported photo file type.';
      // Base64 runs ~1.37x the raw byte size. This caps each photo around
      // ~3MB raw — generous next to the frontend's own compression (max
      // 1000px, 0.7 quality JPEG, typically well under 500KB), while still
      // blocking an abusive payload sent directly to the API.
      if (photo.data.length > 4200000) return 'One or more photos are too large.';
    }
  }

  return null;
}

function createBooking(payload) {
  const validationError = validatePayload(payload);
  if (validationError) return jsonResponse({ success: false, error: validationError });

  // Simple concurrency guard so two simultaneous submissions can't
  // collide and generate the same Booking ID.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const bookingId = generateBookingId();
    const timestamp = new Date();

    let photoUrls = [];
    const createdFiles = [];
    if (payload.photos && payload.photos.length) {
      const folder = getOrCreatePhotoFolder();
      try {
        payload.photos.forEach(function (p, i) {
          let bytes;
          try {
            bytes = Utilities.base64Decode(p.data);
          } catch (decodeErr) {
            throw new Error('One or more photos could not be decoded. Please select the photos again.');
          }
          const extension = p.mimeType === 'image/png' ? 'png' : (p.mimeType === 'image/webp' ? 'webp' : 'jpg');
          const blob = Utilities.newBlob(bytes, p.mimeType, bookingId + '_' + (i + 1) + '.' + extension);
          const file = folder.createFile(blob);
          /* PHASE-1 PRIVACY TRADE-OFF: ANYONE_WITH_LINK + VIEW means anyone who
             obtains a photo URL can view it without a Google login. The admin
             dashboard uses a separate shared key and has no Google identity, so
             private Drive files would break the photo links for the admin.
             Revisit this when per-user admin authentication is introduced. */
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          createdFiles.push(file);
          photoUrls.push(file.getUrl());
        });
      } catch (photoErr) {
        createdFiles.forEach(function(file){ try { file.setTrashed(true); } catch (cleanupErr) {} });
        return jsonResponse({ success: false, error: photoErr.message || 'Photo upload failed. Please try again.' });
      }
    }

    sheet.appendRow([
      bookingId, timestamp, payload.name, payload.phone, payload.email || '',
      payload.address, payload.area, payload.wasteType || '', payload.quantity || '',
      payload.pickupDate || '', payload.pickupTime || '', photoUrls.join(', '), 'Pending'
    ]);

    sendAdminNotification(bookingId, payload, photoUrls);

    return jsonResponse({ success: true, bookingId: bookingId });
  } finally {
    lock.releaseLock();
  }
}

function sendAdminNotification(bookingId, p, photoUrls) {
  try {
    const lines = [
      'New pickup booking received.',
      '',
      'Booking ID: ' + bookingId,
      'Name: ' + p.name,
      'Phone: ' + p.phone,
      'Email: ' + (p.email || '-'),
      'Address: ' + p.address,
      'Area: ' + p.area,
      'Waste type: ' + (p.wasteType || '-'),
      'Quantity: ' + (p.quantity || '-'),
      'Pickup date: ' + (p.pickupDate || '-'),
      'Pickup time: ' + (p.pickupTime || '-'),
      'Photos: ' + (photoUrls.length ? photoUrls.join('\n') : 'None'),
      '',
      'Open your Google Sheet to see all bookings.'
    ];
    MailApp.sendEmail({
      to: getAdminConfig_().email,
      subject: 'New Ecobin Waste Booking: ' + bookingId,
      body: lines.join('\n')
    });
  } catch (e) {
    // Email failure should never break the booking itself.
  }
}

function listBookings() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  }).reverse(); // newest first
}

function updateStatus(payload) {
  const authError = requireAdminKey_(payload && payload.key);
  if (authError) return authError;
  const allowed = ['Pending', 'Scheduled', 'Completed', 'Cancelled'];
  if (allowed.indexOf(payload.status) === -1) {
    return jsonResponse({ success: false, error: 'Invalid status value.' });
  }
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.bookingId) {
      sheet.getRange(i + 1, HEADERS.indexOf('Status') + 1).setValue(payload.status);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ success: false, error: 'Booking ID not found.' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
