# Ecobin Waste — Roadmap

A phase-by-phase plan connecting business growth to which disabled features in `config.js` get turned on. Nothing here should be enabled early — each item has a real dependency (a partner, a paid service, a volume of customers) that should exist *before* the feature does, not after. That order is what keeps the site honest.

---

## Phase 1 — Current: Early Startup
*Where you are now.*

**Reality:** No fixed hours, one person, WhatsApp-first, Google Sheets as the database, zero paid tools.

**What's live:**
- Free pickup + scrap buying (honestly labeled as both)
- Online booking → Google Sheets, with email alerts to you
- Basic admin dashboard (`admin.html`)
- Collection Acknowledgement (not a certified disposal certificate)
- FAQ chatbot, WhatsApp/Call buttons, local SEO basics

**What stays off:** Everything in `config.js` → `FUTURE`. All of it depends on things that don't exist yet — an authorized recycling partner, paid infrastructure, or enough volume to justify the work.

**Focus for this phase:** Get to your first 10–20 real bookings. Use those to get real testimonials and real before/after photos — the site has placeholder sections built and waiting for exactly this.

---

## Phase 2 — ~100 Customers
*You have a repeat customer base and a documented process.*

**Enable:**
- `emailAutomation` — once MailApp's manual-ish email alerts feel limiting, move to a proper transactional email service (e.g. templated confirmation + reminder emails)
- Real testimonials and before/after gallery — replace the placeholder cards with actual content (once enough genuine customer stories exist)
- `collectionAcknowledgementPDF` — turn the current plain-text acknowledgement into a downloadable PDF (still not a certified disposal certificate — just a nicer version of what you already do)

**Consider starting (not code, business steps):**
- Talking to an authorized recycler about a formal partnership — this is the prerequisite for `disposalCertificate`, not something the website can shortcut

**Still off:** Certificate, dashboards, driver app, payments — no volume or infra justification yet.

---

## Phase 3 — ~1,000 Customers
*Consistent volume, probably more than one person working the business.*

**Enable:**
- `disposalCertificate` — **only if** the authorized recycler partnership from Phase 2 is actually signed. This is the single most important rule in this roadmap: this flag existing in code is not permission to turn it on; the real-world partnership is.
- `customerDashboard` — repeat customers can log in and see their own booking history instead of you looking it up manually
- `smsNotifications` — pickup reminders by SMS in addition to WhatsApp/email (this has real per-message cost — budget for it before enabling)
- `driverApp` / `driverTracking` — if you've hired drivers, they need their own simple interface rather than you coordinating everything by phone
- Migrate off Google Sheets to a real database (Supabase/PostgreSQL) — `BookingAPI` in `script.js` was built specifically so this migration doesn't require rebuilding the website

**Still off:** Payments, AMC, corporate/vendor portals, CRM — these are Phase 4+ territory.

---

## Phase 4 — Corporate Clients
*You're signing contracts with offices/IT companies, not just booking individual pickups.*

**Enable:**
- `corporatePortal` — a corporate client's facility manager should be able to see their company's pickup history, not just one household's
- `invoiceGenerator` — corporate clients often need proper invoices for their own accounting, even if pickup is still free for them
- `paymentGateway` — **only if** you introduce a paid tier (e.g. AMC contracts, or scrap-buying settlements that need a formal payment trail). Real fees and compliance apply — don't enable casually.
- `amc` — annual maintenance contracts for offices with recurring e-waste
- `adminLogin` — a single shared `ADMIN_KEY` stops being appropriate once more than one person needs admin access; move to real per-person logins
- `crm` — enough relationship complexity (corporate accounts, recurring contracts, sales pipeline) to justify a real CRM instead of a spreadsheet

---

## Phase 5 — Multi-City Expansion
*Beyond Kalyan, Dombivali, Ulhasnagar and Navi Mumbai.*

**Enable:**
- `vendorPortal` — if you're partnering with local operators in new cities rather than doing every pickup yourself, they need their own limited-access interface
- `analyticsDashboard` — enough data volume (multiple cities, many drivers, high booking counts) that a proper analytics build is worth the investment, rather than reading a spreadsheet
- Dedicated local SEO pages per city (the site is currently built for Kalyan, Dombivali, Ulhasnagar and Navi Mumbai specifically — expansion means replicating that local-SEO structure for each new city, with genuinely separate content, not just swapping a city name)

**Business note:** by this phase, the "startup with limited budget" framing that's shaped every decision so far (no fabricated stats, no fake certifications, Google Sheets instead of paid infrastructure) should have naturally evolved — you'll have the revenue to justify real infrastructure. The site was built to grow into that without needing a rebuild at any phase.

---

## The one rule that applies to every phase

A feature in `config.js` being technically ready to flip from `false` to `true` is never, by itself, the reason to do it. The reason is always the real-world thing it depends on actually being true first: the partner signed, the volume reached, the budget allocated. That order — reality first, feature flag second — is what's kept this site honest so far, and it's the thing to protect as the business grows.
