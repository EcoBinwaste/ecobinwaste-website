# EcoBin Waste — Launch Readiness

## Source status

**READY FOR LIVE SETUP.**

The website source has been audited for structure, responsive behavior, dark mode, booking logic, backend validation, security boundaries, SEO, structured data, accessibility basics and content honesty.

## Before public launch

- [ ] Create/confirm the Google Sheet used by the Apps Script backend.
- [ ] Deploy `Code.gs` as a Google Apps Script Web App.
- [ ] Store `ADMIN_KEY` in Apps Script Script Properties.
- [ ] Optionally store `ADMIN_EMAIL` in Script Properties for booking alerts.
- [ ] The public booking path is WhatsApp and requires no backend URL.
- [ ] If you later enable the Google Apps Script backend, deploy it, test `ping`, then run a real end-to-end booking test.
- [ ] If the backend is enabled later, confirm the Sheet row, Booking ID, email alert and Drive photo upload.
- [ ] If the backend is enabled later, test `admin.html` listing and status update.
- [ ] Open the live site on the actual Android phone and test navigation, WhatsApp, call, dark mode and booking.
- [ ] Confirm the live domain, HTTPS, canonical URL, sitemap and robots file after hosting.

## Important honesty rules

Do not add a Google rating number, testimonial, customer count, certificate, recycler authorization, contract claim or years-of-service claim until it is genuinely true and documented.

The website already contains disabled future-feature structure for those additions.

## Current booking behavior

The public booking form is fully live through WhatsApp. It opens a pre-filled message containing the customer's pickup details, and the customer can attach e-waste photos directly in WhatsApp. There is no fake Booking ID and no empty technical endpoint in the public code.

`Code.gs` is a separate, complete Google Apps Script backend for a future Google Sheets/admin workflow. It is not required for the current WhatsApp booking path.
