const DAILY_MAX = 40;
const SLOT_CAP = 8;
const ALLOWED_DAYS = [1, 2, 3, 5]; // Monday=1, Tuesday=2, Wednesday=3, Friday=5
const HOLIDAYS_KEY = 'patientConsultHolidays';
const BOOKINGS_KEY = 'patientConsultBookings';

const qrContainer = document.getElementById('qr-code');
const pageUrlElement = document.getElementById('page-url');
const form = document.getElementById('booking-form');
const statusBox = document.getElementById('status-box');
const summaryOutput = document.getElementById('summary-output');
const resetButton = document.getElementById('reset-bookings');

const holidays = loadHolidays();
const bookings = loadBookings();

function loadHolidays() {
  const stored = window.localStorage.getItem(HOLIDAYS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      return [];
    }
  }
  return [];
}

function loadBookings() {
  const stored = window.localStorage.getItem(BOOKINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      return {};
    }
  }
  return {};
}

function saveBookings() {
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function getFormattedUrl() {
  return window.location.href;
}

function buildQrCode() {
  const url = getFormattedUrl();
  pageUrlElement.textContent = url;
  new QRCode(qrContainer, {
    text: url,
    width: 240,
    height: 240,
    colorDark: '#111827',
    colorLight: '#f9fafb',
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().slice(0, 10);
}

function getDayLabel(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

function isHoliday(dateString) {
  return holidays.some((holiday) => holiday.date === dateString);
}

function getDailyCount(dateString) {
  return bookings[dateString]?.accepted || 0;
}

function getSlotCount(dateString, slot) {
  return bookings[dateString]?.slots?.[slot] || 0;
}

function addBooking(dateString, slot) {
  if (!bookings[dateString]) {
    bookings[dateString] = { accepted: 0, slots: {} };
  }
  bookings[dateString].accepted += 1;
  bookings[dateString].slots[slot] = getSlotCount(dateString, slot) + 1;
  saveBookings();
}

function renderSummary() {
  const dates = Object.keys(bookings).sort();
  if (!dates.length) {
    summaryOutput.innerHTML = '<p>No bookings stored yet. Submit a booking to see summary data.</p>';
    return;
  }

  let totalAccepted = 0;
  let details = dates.map((date) => {
    const dayLabel = getDayLabel(date);
    const dailyCount = getDailyCount(date);
    totalAccepted += dailyCount;
    const slotRows = Object.entries(bookings[date].slots)
      .map(([slot, count]) => `<li>${slot}: ${count}</li>`)
      .join('');
    return `<li><strong>${date} (${dayLabel})</strong> — ${dailyCount} accepted<ul>${slotRows}</ul></li>`;
  }).join('');

  summaryOutput.innerHTML = `
    <p><strong>Total accepted bookings:</strong> ${totalAccepted}</p>
    <ul>${details}</ul>
  `;
}

function showStatus(message, type = 'success') {
  statusBox.textContent = message;
  statusBox.className = `status-box ${type}`;
  statusBox.classList.remove('hidden');
}

function clearStatus() {
  statusBox.textContent = '';
  statusBox.className = 'status-box hidden';
}

function validateBooking(dateString, timeSlot) {
  const formattedDate = formatDate(dateString);
  const selectedDate = new Date(formattedDate + 'T00:00:00');
  const dayNumber = selectedDate.getDay();
  const reason = [];

  if (!ALLOWED_DAYS.includes(dayNumber)) {
    reason.push('Selected date is not a valid consult day. Only Monday, Tuesday, Wednesday, and Friday are allowed.');
  }

  if (isHoliday(formattedDate)) {
    reason.push('Selected date is a holiday and is not available for booking.');
  }

  if (getDailyCount(formattedDate) >= DAILY_MAX) {
    reason.push('Daily capacity has been reached for the selected date. Please choose another date.');
  }

  if (getSlotCount(formattedDate, timeSlot) >= SLOT_CAP) {
    reason.push('This time slot is full for the selected date. Please choose another time.');
  }

  return { formattedDate, reason };
}

function resetBookings() {
  window.localStorage.removeItem(BOOKINGS_KEY);
  Object.keys(bookings).forEach((key) => delete bookings[key]);
  renderSummary();
  showStatus('Stored bookings have been reset.', 'success');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearStatus();

  const formData = new FormData(form);
  const fullName = formData.get('fullName')?.trim();
  const age = formData.get('age');
  const rank = formData.get('rank');
  const reason = formData.get('reason')?.trim();
  const consultDate = formData.get('consultDate');
  const consultTime = formData.get('consultTime');

  if (!fullName || !age || !rank || !reason || !consultDate || !consultTime) {
    showStatus('Please fill in all required fields before submitting.', 'error');
    return;
  }

  const { formattedDate, reason: validationErrors } = validateBooking(consultDate, consultTime);
  if (validationErrors.length) {
    showStatus(validationErrors.join(' '), 'error');
    return;
  }

  addBooking(formattedDate, consultTime);
  showStatus(`Booking accepted for ${formattedDate} at ${consultTime}.`, 'success');
  renderSummary();
  form.reset();
});

resetButton.addEventListener('click', () => {
  if (window.confirm('Reset all stored booking data? This cannot be undone.')) {
    resetBookings();
  }
});

buildQrCode();
renderSummary();
