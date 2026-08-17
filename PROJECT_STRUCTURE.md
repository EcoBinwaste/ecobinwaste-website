# Ecobin Waste — Project Structure

This explains every file in plain language — what it does, whether you'll ever need to touch it, and how the pieces connect. Written for a non-developer.

---

## The short version

Your website is **one main page** (`index.html`) plus a handful of supporting files. There's also a separate small **admin page** (`admin.html`) only you use, and a **backend** that lives inside your Google account (not on the website at all).

```
📁 Your website folder
├── index.html              ← the actual website customers see
├── admin.html               ← your private booking dashboard
├── style.css                 ← all the visual design (colors, spacing, layout)
├── script.js                  ← all the interactive behavior (carousel, chat bot, forms)
├── config.js                   ← live settings (WhatsApp, Analytics, Maps and future-feature flags)
├── manifest.json               ← lets phones "install" the site like an app icon
├── robots.txt                   ← tells Google it's allowed to index your site
├── sitemap.xml                   ← tells Google what pages exist
├── 📁 images/
│    ├── logo.png                  ← high-quality source logo
│    ├── logo.webp                 ← optimized web logo used by the page                  ← your logo, used across the site
│    ├── favicon-16x16.png          ← tiny icon shown in browser tabs
│    ├── favicon-32x32.png
│    ├── icon-192.png               ← icon used if someone "installs" the site
│    ├── icon-512.png
│    ├── apple-touch-icon.png        ← icon used if an iPhone user adds to home screen
│    └── og-image.jpg                ← the banner image shown when your link is shared on WhatsApp/Facebook
│
📁 Lives in your Google account (not uploaded to the website)
├── Code.gs                  ← the backend: saves bookings, emails you, generates Booking IDs
└── (Google Sheet)            ← your actual booking "database"

📄 Documentation (for you, not the website)
├── SETUP-GUIDE.md            ← step-by-step: connect the backend
├── PROJECT_STRUCTURE.md        ← this file
└── ROADMAP.md                   ← what to enable, and when, as you grow
```

---

## File by file

### `index.html`
The website itself. Every section a customer sees — hero banner, services, FAQ, booking form, footer — lives in this one file, in the order they appear on the page. It doesn't contain the visual styling or the interactive logic directly anymore — it *links to* `style.css` and `script.js`, the way a recipe references ingredients kept in separate containers instead of listing everything in one paragraph.

**When would you edit this?** Changing the actual words on the page — a sentence, a phone number, a FAQ answer.

### `admin.html`
Your private dashboard. Not linked from the public site (customers can't stumble onto it), and it has `noindex` set so Google won't list it either. Opens a login-style screen asking for your deployed Google Apps Script backend URL and admin password (the `ADMIN_KEY` stored in Apps Script Script Properties), then shows every booking with filters, search, and a way to change status.

**When would you edit this?** Rarely — mostly you'll just *use* it, not edit it.

### `style.css`
Every visual decision on the site: colors, fonts, spacing, button shapes, the green color scheme, hover effects, mobile layout rules. Separated from `index.html` so that (a) the browser can cache it — meaning repeat visitors load your site faster — and (b) so a designer could restyle the whole site without touching a single word of your content.

**When would you edit this?** If you want to change how something *looks* (not what it says).

### `script.js`
All the interactive behavior: the image carousel auto-advancing, the chat bot answering questions, the booking form validating and submitting, dark mode, scroll animations, the scroll-to-top button. Built as several independent pieces, each wrapped in its own error-handling — so if one feature ever breaks, it can't take the others down with it (this happened once before; it's now structurally prevented).

**When would you edit this?** Only if you want to change *how something behaves*, not just how it looks. This is genuine code — safest to have me make changes here rather than editing directly.

### `config.js`
The **one file** meant for you to edit directly. Currently holds:
- Your WhatsApp number
- Your Google Analytics ID
- Your Google Maps location ID
- A list of **Future Features**, all set to `false` (disabled) — see `ROADMAP.md` for when to enable each one on

**Why does this matter?** Nothing else in the website ever hardcodes these values directly — they all read from this one file. If you ever change your WhatsApp number or switch backends, you change it here once, not hunt through hundreds of lines of code.

### `manifest.json`
A small technical file that lets a customer's phone treat your website a bit like an app — e.g., if they "Add to Home Screen," it uses your logo as the icon and your green as the theme color. Doesn't affect anything else.

### `robots.txt` / `sitemap.xml`
Both are instructions for Google, not for humans. `robots.txt` says "you're allowed to crawl this site." `sitemap.xml` lists your pages so Google finds them faster. You'll update `sitemap.xml` yourself if you add new pages later (e.g., city-specific pages) — or ask me to.

### `images/` folder
Your logo, in several sizes for different purposes (favicon, home-screen icon, social preview banner). All generated from the one logo you uploaded. If you ever get a new/updated logo, send it to me and I'll regenerate this whole set.

---

## The backend: `Code.gs` and your Google Sheet

This is the part that doesn't live on your website at all — it lives inside your own Google account, for free, via Google Apps Script.

- **Your Google Sheet** is the actual "database" — every booking becomes one row.
- **`Code.gs`** is the "API" — the code that runs when someone submits the booking form. It validates the data, generates a Booking ID, saves the row, uploads any photos to Google Drive, and emails you.
- The website talks to this backend through **one JavaScript object**, `BookingAPI`, inside `script.js`. This is the "modular" part you asked about: if you ever outgrow Google Sheets and move to a real database (Supabase, PostgreSQL, etc.), only the *inside* of `BookingAPI` needs to be rewritten. The booking form, the validation, the success screen — none of that has to change.

---

## How a booking actually flows, start to finish

1. Customer fills out the form on `index.html`.
2. `script.js` validates it in the browser (friendly, instant error messages).
3. `BookingAPI.submit(...)` opens WhatsApp with the complete pickup details pre-filled.
4. The customer sends the message and can attach photos directly in WhatsApp.
5. `Code.gs` is a separate complete backend that can later be deployed for Google Sheets storage, Booking IDs, Drive photos, email alerts and the admin dashboard.

---

## What "modular" means here, concretely

You asked to be able to replace pieces without rewriting the whole site. Here's what's already true:

| Piece | How it's separated | To replace it |
|---|---|---|
| Booking backend | All backend calls go through `BookingAPI` in `script.js` | Rewrite the inside of `BookingAPI`; nothing else changes |
| Google Sheets/Apps Script | Entirely separate from the website, only referenced via a URL in `config.js` | Deploy a new backend, paste the new URL into `config.js` |
| Admin panel | A separate file (`admin.html`), not embedded in the main site | Replace or rebuild `admin.html` independently — the main site is untouched |
| Chatbot | Its FAQ answers live in one data array in `script.js` | Edit the array to add/change answers; swap in a smarter AI backend later without touching the rest of the site |
| Styling | All in `style.css` | Redesign without touching any content or logic |

---

## If you're not sure where something lives

Just ask me — describe what you're trying to change ("the color of the WhatsApp button," "the wording on the free pickup badge," "who gets emailed when someone books") and I'll tell you exactly which file it's in, or make the change directly.
