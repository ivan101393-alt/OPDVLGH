# Patient Consult Booking Platform

This repository now includes a static online booking platform with a generated QR code, patient booking form, Google Sheets integration, and a physician dashboard for authorized staff.

## Files
- `index.html` — the main booking page.
- `physician_dashboard.html` — the physician dashboard page.
- `style.css` — page styling.
- `app.js` — form validation, booking logic, QR code generation, and optional Google Sheets submission.
- `dashboard.js` — dashboard client for Google Sheets data.
- `google_apps_script/booking_api.gs` — Google Apps Script backend template to store and expose booking data.
- `patient_consult_form_preview.html` — original preview file.
- `patient_consult_form_preview_qr.png` — QR code generated for the preview page.

## Google Sheets integration

To store full patient records and make them available to authorized staff:

1. Create a Google Sheet and add a sheet named `Bookings`.
2. Add these exact headers in row 1:
   - `Timestamp`, `FullName`, `Age`, `Category`, `Reason`, `Comorbidities`, `ConsultDate`, `Status`, `ConfirmationNumber`
3. Create a new Google Apps Script project, paste `google_apps_script/booking_api.gs`, and save.
4. Deploy the script as a web app:
   - Execute as: `Me`
   - Who has access: `Anyone` or `Anyone with the link`
5. Copy the web app URL.
6. Set the URL in `app.js` in the `SHEETS_WEB_APP_URL` constant.
7. Set the same URL in `dashboard.js`.
8. Share the Google Sheet with authorized physician accounts only.

## How to test locally

1. Open `index.html` directly in your browser, or run a local server:

```bash
cd /workspaces/OPDVLGH
python3 -m http.server 8000
```

2. Visit:

```text
http://127.0.0.1:8000/index.html
```

3. Scan the QR code displayed on the page with your phone.

## Booking behavior

- Accepts only Monday, Tuesday, Wednesday, and Friday.
- Rejects holidays automatically.
- Enforces daily capacity of `40` accepted bookings.
- Enforces a slot capacity of `8` bookings per time slot.
- Stores accepted bookings in browser local storage.

## Deploy

To publish online, use GitHub Pages or any static hosting provider.

1. Commit the repo.
2. Enable GitHub Pages from the repository settings.
3. Choose the branch containing `index.html` and save.

The `index.html` page will then be available as a public booking form URL.
