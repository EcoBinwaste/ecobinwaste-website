/* ==========================================================
   Ecobin Waste — configuration
   This is the public-site configuration file. Private backend secrets are kept in Apps Script Script Properties, never here.
   Nothing in script.js or index.html should ever hardcode these
   values directly — they all read from window.ECOBIN_CONFIG.
   ========================================================== */

window.ECOBIN_CONFIG = {
  // Current public booking channel. The website uses WhatsApp for live customer
  // booking until a deployed backend is intentionally connected.
  BOOKING_METHOD: 'whatsapp',

  // Digits only, country code first, no + or spaces.
  WHATSAPP_NUMBER: '918736871481',

  // Google Analytics 4 Measurement ID. This IS the live source of truth —
  // the gtag script in index.html's <head> reads this value directly.
  GA4_MEASUREMENT_ID: 'G-2GC5MN8GV8',

  // Your verified Google Business Profile CID (from the Maps share link).
  // ⚠️ UNLIKE the other values above, this is NOT actually centralized:
  // it's also hardcoded directly in index.html in 6 places (the map embed,
  // 3 "View on Google Maps" links, and the LocalBusiness/hasMap structured
  // data). That's intentional, not an oversight — structured data (JSON-LD)
  // should stay static HTML for search engines to read reliably, rather than
  // being filled in by JavaScript after the page loads. If your Google
  // Business Profile location ever changes, update this value here AND
  // search index.html for the same CID to update all 6 places (or just
  // tell me and I'll do a consistent find-and-replace across all of them).
  GOOGLE_MAPS_CID: '3420072044024006103'
};

/* ==========================================================
   FUTURE FEATURES — registry, not a to-do list.
   This object is real, active code — every key below can be
   checked in script.js (e.g. `if (ECOBIN_CONFIG.FUTURE.smsNotifications)`).
   Every value must stay `false` until its real-world dependency
   (listed below, outside the object) is actually true. Flipping
   a value here without the dependency being real is the same
   honesty problem the certificate messaging had — don't do it.
   See ROADMAP.md for which phase enables which feature.

   Dependencies (kept outside the object on purpose, so the
   object itself stays a clean, simple list of flags):

   - disposalCertificate         → official recycling partner + certificate process signed
   - googleRating                → real Google review count/rating exists on the verified GBP listing
   - realTestimonials            → at least a few genuine customer quotes, with permission to publish
   - realGalleryPhotos           → real before/after photos from completed pickups
   - customerDashboard           → authenticated customer accounts + booking history storage
   - adminLogin                  → per-person admin accounts, replacing the shared ADMIN_KEY
   - driverApp / driverTracking  → hired drivers + a driver-facing mobile view
   - smsNotifications            → an SMS gateway account (e.g. Twilio/MSG91) — real per-message cost
   - emailAutomation             → a transactional email service beyond Apps Script's MailApp
   - invoiceGenerator            → a PDF generation step (e.g. Apps Script + Docs template)
   - collectionAcknowledgementPDF→ same PDF step, applied to the acknowledgement document
   - paymentGateway              → a payment gateway account (Razorpay/PayU) — real fees + compliance
   - amc                         → contract terms for recurring service agreements
   - corporatePortal / vendorPortal → multi-user roles/permissions beyond a single admin
   - crm / analyticsDashboard    → enough booking volume to justify a dedicated build
   ========================================================== */
window.ECOBIN_CONFIG.FUTURE = {
  disposalCertificate: false,
  googleRating: false,
  realTestimonials: false,
  realGalleryPhotos: false,
  customerDashboard: false,
  adminLogin: false,
  driverApp: false,
  driverTracking: false,
  smsNotifications: false,
  emailAutomation: false,
  invoiceGenerator: false,
  collectionAcknowledgementPDF: false,
  paymentGateway: false,
  amc: false,
  corporatePortal: false,
  vendorPortal: false,
  crm: false,
  analyticsDashboard: false
};
