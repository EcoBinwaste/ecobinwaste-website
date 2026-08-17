# Changelog

## Master audit — 2026-08-15

- Re-audited the complete master source.
- Removed source-code credential placeholders from `Code.gs`; admin secrets now use Apps Script Script Properties.
- Added a truthful WhatsApp fallback when the online booking backend is not yet configured.
- Hardened photo handling so failed uploads do not silently produce a successful booking without the selected photos.
- Expanded Booking IDs to a six-digit persistent sequence.
- Tightened SEO title/description and customer-facing wording.
- Kept dark mode, future-feature flags and Collection Acknowledgement behavior intact.
- Reworked future gallery/review copy so the visual structure remains attractive without fabricating customer evidence.
- Added no-JavaScript guidance and improved accessibility labels.
- Revalidated HTML, CSS, JavaScript, Apps Script syntax and JSON-LD.



All notable changes to the Ecobin Waste website are recorded here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).



## [1.0.0] — 2026-08-08



First version considered launch-ready. Marks the end of the initial build/refactor phase and the start of "real content over time" (real testimonials, real photos, real growth) rather than structural changes.



### Added

- Full booking system: multi-field form (pickup date/time, waste type, quantity, address, photo upload) → Google Apps Script backend → Google Sheets database, with unique Booking IDs, email alerts, and a success screen.

- Admin dashboard (`admin.html`): stats, status filters, search, CSV export, per-row status updates.

- FAQ chatbot with keyword matching and quick-reply buttons.

- Google Business Profile integration: exact verified address, embedded map, structured data synced to the real listing.

- LocalBusiness + FAQPage structured data (JSON-LD), Open Graph + Twitter Card tags, sitemap.xml, robots.txt.

- Full favicon package (16px–512px) + `manifest.json` for home-screen install support.

- Codebase split into `index.html` / `style.css` / `script.js` / `config.js` for maintainability and caching, with all site-wide settings (backend URL, WhatsApp number, Analytics ID) centralized in `config.js`.

- `FUTURE` feature registry in `config.js` — a real, inspectable object listing every planned-but-disabled feature (disposal certificate, customer/admin dashboards, driver app, SMS, invoicing, payments, CRM, etc.), all set to `false`.

- Documentation: `README.md`, `PROJECT_STRUCTURE.md`, `ROADMAP.md`, `SETUP-GUIDE.md`, `FINAL-AUDIT.md`, this changelog.



### Changed

- Rewrote the "Why Not The Local Kabadiwala" comparison section into a positive "Why Choose Ecobin Waste" section — removed all competitor-framed and unsupported-comparison language.

- Corrected pricing messaging site-wide to reflect the real dual model (free pickup for most e-waste, fair-price buying for bulk/high-value scrap) instead of an unqualified "100% free" claim.

- Corrected footer service-area claim ("Kalyan-Thane-Mumbai belt") to match the actual four active service areas (Kalyan, Dombivali, Ulhasnagar, Navi Mumbai) — Thane and general "Mumbai" were never genuinely active areas.



### Removed / Disabled (commented, not deleted)

- All "Disposal Certificate" / "Certified Disposal" claims — replaced with the honest "Collection Acknowledgement" concept across visible copy, structured data, and the chatbot. Original wording preserved in `<!-- Future Feature -->` comments for later reinstatement once an official recycling partnership exists.

- Fabricated trust elements were never added in the first place and remain excluded on principle: star ratings, "years of experience," animated statistics, fake customer counts, exit-intent popups.



### Known limitations at this version

See `FINAL-AUDIT.md` for the full list — in short: booking backend requires manual one-time setup (`SETUP-GUIDE.md`) before it will actually save data; admin authentication is a single shared password appropriate for one person only; gallery/testimonials are placeholder-flagged pending real content.

## 2026-08-16 — Master technical cleanup

- Removed the empty public Apps Script endpoint configuration; the live public booking path is WhatsApp until a real backend deployment is intentionally connected.
- Removed the unused public booking-success/Booking-ID path from the WhatsApp-only flow.
- Simplified photo handling to local preview only; customers attach the actual photos in WhatsApp.
- Removed stale documentation describing an empty/sample backend URL in public configuration.
- Removed stale/over-strong marketing wording such as "newly launched" and unqualified "fair price" wording.
- Revalidated HTML structure, JavaScript syntax, CSS balance, JSON-LD, local asset references and future-feature flags.
