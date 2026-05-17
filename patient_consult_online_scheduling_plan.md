# Online Patient Consult Scheduling Setup Plan

## 1) Schedule and Capacity Rules
- **Consultation days:** Monday, Tuesday, Wednesday, and Friday only.
- **Consultation hours:** 7:00 AM to 12:00 noon.
- **Exclude holidays:** disable booking on holidays manually each month.
- **Maximum patients per day:** 40 total submissions.

## 2) Platform Components
Use these Google tools:
1. **Google Form** (patient registration form; one-page only)
2. **Google Sheets** (automatic response database)
3. **Google Apps Script** (automate daily limit, holiday block, monthly reports)
4. **QR Code** (points to Google Form link)

## 3) One-Page Google Form Design
Create one Google Form section only (no additional sections/pages). Required fields:
1. **Full Name** (Short answer, Required)
2. **Age** (Short answer or Number validation, Required)
3. **Rank** (Dropdown or Short answer, Required)
4. **Reason for Consult** (Paragraph, Required)
5. **Comorbidity** (Checkboxes, Optional or Required as needed)
   - Diabetes
   - Hypertension
   - Malignancy/Cancer
   - PTB
   - Pneumonia
   - COPD
   - Other: _______
6. **Preferred Consult Date** (Date field, Required)
7. **Preferred Consult Time** (Multiple choice, Required)
   - 7:00–8:00 AM
   - 8:00–9:00 AM
   - 9:00–10:00 AM
   - 10:00–11:00 AM
   - 11:00 AM–12:00 noon

Recommended Form settings:
- Turn ON: Collect timestamp (automatic)
- Turn OFF: “Limit to 1 response” unless users have Google accounts
- Add note in description:
  - “Schedule is Monday–Wednesday and Friday only, 7:00 AM–12:00 noon, excluding holidays.”
  - “Maximum of 40 patients per day. Once full, select another date.”

## 4) Booking Validation Logic
Apply validation in Google Apps Script linked to the response sheet:

### Rules to enforce on each submission
1. Reject if selected date is **Thursday, Saturday, or Sunday**.
2. Reject if selected date is in **holiday list**.
3. Reject if selected date already has **40 accepted patients**.
4. Reject if selected date + preferred time slot is already full (set slot cap, e.g., 8 per hour across 5 slots).
5. If rejected, mark status as `REJECTED` and email/update instructions to reschedule.
6. If accepted, mark status as `ACCEPTED`.


## 5) Sheet Structure
In linked Google Sheet, use:
- `Form Responses 1` (raw data from form)
- `Holidays` sheet:
  - Column A: `Holiday Date` (YYYY-MM-DD)
  - Column B: `Holiday Name`
- `Monthly Report` sheet for summary output

Add calculated/helper columns in `Form Responses 1`:
- `Status` (ACCEPTED/REJECTED)
- `Rejection Reason`
- `Consult Month` (e.g., 2026-05)
- `Day of Week`
- `Time Slot`
- `Slot Count` (patients in the selected date+time slot)

## 6) Monthly Reporting Requirements
Generate monthly statistics automatically:
1. Total submissions
2. Total accepted
3. Total rejected
4. Rejected due to day mismatch
5. Rejected due to holiday
6. Rejected due to full capacity (40/day)
7. Rejected due to full time slot
8. Count by comorbidity type
9. Count by rank
10. Count by time slot

Recommended automation:
- Create Apps Script time trigger: run every month-end (e.g., 11:55 PM on last day of month).
- Script generates/update `Monthly Report` rows for the month.
- Optional: auto-email CSV/PDF summary to clinic admin.

## 7) QR Code Registration Flow
1. Copy the Google Form public link.
2. Generate QR code using:
   - Google Chrome “Create QR code”, or
   - trusted QR generator.
3. Print and place at clinic entrance / online channels.
4. Test QR on Android and iOS before deployment.

## 8) Patient Workflow
1. Patient scans QR code.
2. Form opens in browser.
3. Patient chooses available date and preferred time slot, then completes one-page form.
4. Submission is validated automatically.
5. Patient receives confirmation or reschedule instruction.

## 9) Admin Workflow
Daily:
- Check accepted count per date and per time slot.
- Monitor rejected entries for correction.

Monthly:
- Review generated monthly report.
- Archive/export report for records and compliance.
- Update holiday list for next month.

## 10) Implementation Checklist
- [ ] Create one-page Google Form with required fields
- [ ] Link Form to Google Sheet
- [ ] Add `Holidays` and `Monthly Report` tabs
- [ ] Add Apps Script validation for day/holiday/daily-capacity/time-slot-capacity
- [ ] Add status columns and logic
- [ ] Add monthly report generator
- [ ] Generate and test QR code
- [ ] Perform end-to-end test with at least 5 sample submissions

## 11) Data Privacy and Security Notes
- Avoid collecting unnecessary sensitive medical history beyond required scope.
- Restrict Google Sheet access to authorized clinic staff only.
- Enable 2FA on admin Google accounts.
- If required by local policy/law, include a short consent/privacy statement in the form.
