# Ecobin Waste — Booking System Setup Guide

This connects your website's booking form to a free Google Sheets "database" using Google Apps Script. Takes about 15 minutes. No coding required beyond copy-paste.

Follow these steps in order — each one depends on the last.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Rename it (top-left) to `Ecobin Waste Bookings`.
3. Leave it empty — the script creates the right columns automatically the first time someone books.

## Step 2 — Open Apps Script

1. In the Sheet, go to **Extensions → Apps Script**. This opens a separate code editor tied to this specific Sheet.
2. Delete any starter code you see in the editor (usually a `myFunction(){}` placeholder).

## Step 3 — Add Code.gs

1. Open the `Code.gs` file I gave you, copy **all** of it.
2. Paste it into the Apps Script editor, replacing everything.

## Step 4 — Set the private admin settings

The backend no longer stores a real email address or admin password in `Code.gs`. This keeps secrets out of source code.

In Apps Script open **Project Settings → Script Properties → Add script property** and create:

- `ADMIN_KEY` — choose a strong private password.
- `ADMIN_EMAIL` — optional. If omitted, the script uses the Apps Script owner's effective email when Google provides it.

Save the properties before deployment. Never paste the admin key into the public website files.

## Step 6 — Deploy as a Web App

1. Top-right, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.

## Step 7 — Set access correctly

In the same deployment dialog, fill in:
- Description: `Ecobin Waste booking API`
- Execute as: **Me**
- Who has access: **Anyone**

"Anyone" sounds broad, but it's required — your website (running in a visitor's browser) has no Google login of its own, so the endpoint has to be reachable without one. The `ADMIN_KEY` is what actually protects the sensitive parts (viewing/editing bookings); anyone can *submit* a booking (that's the point), but only you can *read* the list.

Click **Deploy**. Google will ask you to **authorize** the script (it needs permission to write to your Sheet, your Drive, and send email). Click through: *Authorize access → pick your Google account → "Advanced" → "Go to (project name) (unsafe)" → Allow.* This warning is normal — it's your own script, not a third party.

## Step 8 — Copy the Web App URL

After deploying, copy the **Web app URL** shown — it looks like:
```
https://script.google.com/macros/s/AKfycb.../exec
```
Save this somewhere safe. You need it in the next step.

> Every time you edit `Code.gs` later, you must repeat **Deploy → Manage deployments → Edit (pencil) → New version → Deploy** for changes to go live. Just saving the file isn't enough — this is the single most common thing people forget.

## Step 9 — Keep the backend URL out of the public site until you intentionally connect it

The current public website does not contain an empty or fake Apps Script URL. Its live booking path is WhatsApp. If you later decide to connect the Google Apps Script backend, add the real deployed Web App URL through a deliberate backend-integration change; never invent or paste a sample URL into production code.

## Step 10 — Test ping (only after you deploy the backend)

Before testing a real booking, confirm the backend is actually reachable: paste this into a browser address bar (with your real URL):
```
https://script.google.com/macros/s/AKfycb.../exec?action=ping
```
You should see:
```json
{"success":true,"message":"Ecobin Waste booking backend is live."}
```
If you get an error or a blank page instead, re-check Steps 6–8 before moving on — a real booking test won't work until this does.

## Step 11 — Test a real booking

1. Open `index.html` in a browser (or your live site once hosted).
2. Fill out the booking form completely and submit.
3. You should see a success screen with a Booking ID (e.g. `ECO-20260808-000001`).
4. If it fails, the form shows a clear error message instead of pretending it worked — read that message first; it usually points at exactly what's wrong.

## Step 12 — Check the email

Look in the inbox for the `ADMIN_EMAIL` you set in Step 4. You should have a new email titled "New Ecobin Waste Booking: ECO-...", with all the booking details.

## Step 13 — Check the Google Sheet

Go back to your Sheet. A new tab called **Bookings** should exist (created automatically on the first submission), with a header row and your test booking as the first data row.

## Step 14 — Check uploaded photos

If your test booking included photos: open Google Drive, look for a folder called **Ecobin Waste - Pickup Photos**. Your test photos should be inside, named after the Booking ID. The Sheet's "Photo URLs" column should contain links to them — click one to confirm it opens correctly.

## Step 15 — Open admin.html after backend deployment

1. Open `admin.html` in a browser.
2. Paste your Web App URL (same one from Step 8) and the `ADMIN_KEY` you stored in Script Properties.
3. Click **Load Bookings** — you should see your test booking, with stats, search, status filters, and CSV export all working.
4. Try changing its status via the dropdown — confirm it updates instantly and that reloading the page keeps the new status (it's saved back to the Sheet).

---

## Hosting everything together

When you upload your site, upload `index.html`, `style.css`, `script.js`, `config.js`, `manifest.json`, `admin.html`, `robots.txt`, `sitemap.xml`, and the `images/` folder all into the same directory, keeping the folder structure intact. `Code.gs` never gets uploaded to your website — it only lives inside Google Apps Script.

---

## Known limits of this approach (so you know when to upgrade)

- **~90 seconds max** per request, and Apps Script has daily quotas (100 emails/day, ~20,000 URL fetches/day on a free account) — completely fine for a business getting a handful of bookings a day, worth watching if you scale to dozens per day.
- **No real authentication** — the admin key is a shared password, not a login system. Fine for one person (you); see the Phase-1 note in `admin.html` and `adminLogin` in `config.js` for when to change this.
- **No image thumbnails/resizing on the backend** — photos are compressed in the browser before upload, which is usually enough, but very large uploads could still be slow on poor connections.

## Migrating to Supabase/Postgres later

Everything the website knows about "the backend" lives inside one JavaScript object in `script.js`, reading its URL from `config.js`:

```js
var BookingAPI = (function(){ ... submit(payload) ... })();
```

When you're ready to upgrade, rewrite the *inside* of that function to call Supabase/Postgres instead of Google Apps Script. The booking form, validation, photo compression, and success screen never need to change — they only ever call `BookingAPI.submit(payload)`. Same idea for `admin.html`'s fetch calls if you rebuild the dashboard against the new backend.
