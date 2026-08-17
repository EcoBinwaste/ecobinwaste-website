# Ecobin Waste — Website

Free e-waste pickup and scrap buying website for Ecobin Waste, serving Kalyan, Dombivali, Ulhasnagar and Navi Mumbai. Static frontend + Google Sheets/Apps Script backend — no paid hosting or database required.

For a plain-language explanation of every file, see [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md). For what's built vs. what's a future flag, see [`ROADMAP.md`](./ROADMAP.md). For version history, see [`CHANGELOG.md`](./CHANGELOG.md).

---

## How the project works

- **Frontend**: `index.html` + `style.css` + `script.js` + `config.js` — a single-page static site, no build step, no framework. Open `index.html` directly and it works.
- **Backend**: `Code.gs`, deployed via Google Apps Script (free), using a Google Sheet as the database. Lives entirely inside your Google account — not part of the files you host.
- **Admin**: `admin.html` — a separate, unlinked page that talks to the same backend to list/manage bookings.
- **Connection point**: `config.js` holds the live WhatsApp number, Analytics ID, Maps CID and future-feature registry. There is no fake or empty backend URL in the public code.

The current live booking flow: customer fills the form on `index.html` → `script.js` validates the details → `BookingAPI.submit()` opens WhatsApp with the complete pickup request pre-filled → the customer sends it to Ecobin Waste and can attach photos directly in WhatsApp. The separate `Code.gs` backend is complete and can be deployed later when you choose to move booking storage to Google Sheets.

---

## Local testing

No server or build tools needed.

1. Download all files, keeping the folder structure intact (`index.html` alongside `style.css`, `script.js`, `config.js`, `manifest.json`, and the `images/` folder).
2. Double-click `index.html` to open it in a browser — it works from your local disk (`file://`).
3. The current booking form works locally by opening WhatsApp with the pickup details. The Google Apps Script backend is a separate optional deployment for the future admin/Sheet workflow.
4. Some things behave differently opened locally vs. hosted: `tel:`/`wa.me` links may be blocked by browser sandboxing in certain preview contexts (not a bug — test on an actual phone or after hosting if a Call/WhatsApp button seems unresponsive).

---

## Deployment

This is a static site — any static host works (GitHub Pages, Netlify, Vercel, plain shared hosting, etc.).

1. Upload the full folder structure exactly as-is: `index.html`, `style.css`, `script.js`, `config.js`, `manifest.json`, `admin.html`, `robots.txt`, `sitemap.xml`, and the entire `images/` folder, all in the same root directory.
2. Do **not** upload `Code.gs` — it doesn't belong on a web host; it lives in Apps Script (see below).
3. The project already uses the purchased `ecobinwaste.com` domain in canonical, sitemap and social metadata. Recheck these values only if the final public domain changes.
4. `admin.html` is intentionally not linked from the public site and has `noindex` set — bookmark its URL privately once hosted; don't publish a link to it anywhere.

---

## How to connect Google Apps Script

`Code.gs` is a complete optional backend. If you later want Google Sheets storage, Booking IDs, Drive photo storage, email alerts and the `admin.html` dashboard, follow [`SETUP-GUIDE.md`](./SETUP-GUIDE.md). The current public site does not contain a fake or empty backend URL.

## How to change your WhatsApp number

Open `config.js`, edit:
```js
WHATSAPP_NUMBER: '918736871481',
```
Digits only, country code first, no `+` or spaces. This single value drives every WhatsApp button and link across the site — you never need to hunt through `index.html` for hardcoded numbers.

*(The phone number shown as text in a few places, like the footer and contact section, is written directly in `index.html` since it's just visible content, not a link's behavior — update those manually if your number changes. Ask me to do a find-and-replace if you'd rather not do it by hand.)*

---

## Google Apps Script backend URL

The public site intentionally does not store an empty or sample Apps Script URL. If the backend is connected in a future deployment, use the real URL from Google and make the integration as an explicit project change. Never paste a sample URL into production code.

## How to update content

Most visible text lives directly in `index.html` as plain HTML — headings, paragraphs, FAQ answers, service descriptions. Search for the text you want to change and edit it in place. A few things to know:

- **The chatbot's answers** live in a separate data array inside `script.js` (search for `var FAQ = [`) — update both the visible FAQ section in `index.html` *and* this array if you're changing an answer, so they stay consistent.
- **Structured data** (the `<script type="application/ld+json">` blocks near the top of `index.html`) should be kept in sync with visible content — if you change a FAQ answer on the page, update the matching entry in the FAQ schema too, or Google may show outdated text in search results.
- **"Future Feature" comments**: anything wrapped in `<!-- Future Feature: ... -->` is intentionally disabled/hidden content (like disposal certificate messaging) — don't uncomment it unless the real-world thing it depends on is actually true. See `ROADMAP.md`.
- If you're not confident editing HTML directly, tell me what you want changed in plain language and I'll make the edit.

---

## How to update SEO

- **Title/description**: near the top of `index.html`'s `<head>`, the `<title>` and `<meta name="description">` tags.
- **Structured data**: the two `<script type="application/ld+json">` blocks (LocalBusiness + FAQPage). Keep `areaServed` limited to areas you genuinely serve today — don't add future expansion cities here until they're real (see item on service-area accuracy in `FINAL-AUDIT.md`).
- **Sitemap**: `sitemap.xml` — add a new `<url>` entry if you ever add more pages (e.g. city-specific landing pages).
- **robots.txt**: rarely needs changes; it currently allows all crawling and points at your sitemap.
- **OG/Twitter image**: `images/og-image.jpg` — the banner shown when your link is shared on WhatsApp/Facebook/Twitter. Regenerate it (ask me) if your branding or key message changes.
- **Google Business Profile consistency**: your business name, address, and phone number on the website should always exactly match your GBP listing. If you ever update your GBP, tell me and I'll re-sync the site.

---

## How to add real photos/testimonials

The gallery (`#gallery`) and testimonials (`#testimonials`) sections in `index.html` are currently built as clearly-labeled placeholders — dashed borders, "add your quote here" text, a visible "template content" flag. This is intentional: no fabricated reviews or stock photos pretending to be real ones.

To add real content once you have it:

1. **Photos**: send me the image files (or a description of what you want shown) and I'll compress/resize them the same way the logo and OG image were handled, then swap them into the gallery cards in place of the placeholder icons.
2. **Testimonials**: send me the actual customer quote, their name (or "Name withheld" if they prefer), and their society/office and area — I'll replace the placeholder card content directly. Only add a testimonial you actually have permission to publish.
3. Once at least a few real testimonials/photos exist, the visible "template content — replace with real reviews" flag should be removed (ask me to do this at the same time).

This mirrors the same principle as the disposal certificate: real content when it's real, clearly marked placeholders until then — never fabricated in between.
