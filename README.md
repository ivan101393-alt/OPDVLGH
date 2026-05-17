# Patient Consult Booking Platform

This repository now includes a static online booking platform with a generated QR code and a patient booking form.

## Files
- `index.html` — the main booking page.
- `style.css` — page styling.
- `app.js` — form validation, booking logic, and QR code generation.
- `patient_consult_form_preview.html` — original preview file.
- `patient_consult_form_preview_qr.png` — QR code generated for the preview page.

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
