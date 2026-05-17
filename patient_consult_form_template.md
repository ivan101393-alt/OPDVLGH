# Patient Consult Booking Form Template

Use this template to create the Google Form.

## Form title
Patient Consult Booking

## Form description
Please fill in your details and select a preferred consult date and time.

Schedule is Monday–Wednesday and Friday only, 7:00 AM–12:00 noon, excluding holidays. Maximum of 40 patients per day and slot limits apply. Once full, select another date/time.

## Questions
1. Full Name
   - Type: Short answer
   - Required: Yes

2. Age
   - Type: Short answer or Number
   - Required: Yes
   - Validation: positive number recommended

3. Rank
   - Type: Dropdown or Short answer
   - Required: Yes
   - Example options: Private, Corporal, Sergeant, Lieutenant, Captain, Major, Colonel, General

4. Reason for Consult
   - Type: Paragraph
   - Required: Yes

5. Comorbidity
   - Type: Checkboxes
   - Required: Optional
   - Options:
     - Diabetes
     - Hypertension
     - Malignancy/Cancer
     - PTB
     - Pneumonia
     - COPD
     - Other: _______

6. Preferred Consult Date
   - Type: Date
   - Required: Yes
   - Note: Accept only Monday, Tuesday, Wednesday, Friday dates

7. Preferred Consult Time
   - Type: Multiple choice
   - Required: Yes
   - Options:
     - 7:00–8:00 AM
     - 8:00–9:00 AM
     - 9:00–10:00 AM
     - 10:00–11:00 AM
     - 11:00 AM–12:00 noon

## Recommended Google Form settings
- Collect email addresses: OFF unless needed
- Limit to 1 response: OFF unless all users have Google accounts
- Edit after submit: OFF
- Show progress bar: OFF
- Shuffle question order: OFF
- Respondents can see summary charts and text responses: OFF

## Google Sheet structure
After linking the form to a Google Sheet, add tabs:
- `Holidays`
  - Column A: Holiday Date (YYYY-MM-DD)
  - Column B: Holiday Name
- `Monthly Report`
- `Dry Run Log`

In `Form Responses 1`, add helper columns for:
- Status (ACCEPTED / REJECTED)
- Rejection Reason
- Consult Month
- Day of Week
- Time Slot
- Slot Count

## Validation logic (Apps Script)
1. Reject if selected date is Thursday, Saturday, or Sunday.
2. Reject if selected date is in the holiday list.
3. Reject if selected date already has 40 accepted patients.
4. Reject if selected date + time slot is already full.
5. Mark rejected rows as `REJECTED` with a reason.
6. Mark accepted rows as `ACCEPTED`.

## Notes
- Use the form link to generate a QR code.
- Share the QR publicly so patients can book from mobile.
- Update holidays monthly in the `Holidays` sheet.
