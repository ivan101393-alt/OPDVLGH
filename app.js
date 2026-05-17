const DAILY_MAX = 40;
const ALLOWED_DAYS = [1, 2, 3, 5]; // Monday=1, Tuesday=2, Wednesday=3, Friday=5
const HOLIDAYS_KEY = 'patientConsultHolidays';
const BOOKINGS_KEY = 'patientConsultBookings';

const qrContainer = document.getElementById('qr-code');
const pageUrlElement = document.getElementById('page-url');
const form = document.getElementById('booking-form');
const statusBox = document.getElementById('status-box');
const summaryOutput = document.getElementById('summary-output');
const ticketStub = document.getElementById('ticket-stub');
const printButton = document.getElementById('print-ticket');

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

function parseDateFromInput(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateString) {
  return dateString;
}

function getDayLabel(dateString) {
  const date = parseDateFromInput(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

function isHoliday(dateString) {
  return holidays.some((holiday) => holiday.date === dateString);
}

function getDailyCount(dateString) {
  return bookings[dateString] || 0;
}

function addBooking(dateString) {
  if (!bookings[dateString]) {
    bookings[dateString] = 0;
  }
  bookings[dateString] += 1;
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
    return `<li><strong>${date} (${dayLabel})</strong> — ${dailyCount} patients booked</li>`;
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

function generateConfirmationNumber() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `BK-${timestamp}-${randomSuffix}`;
}

function showTicketStub(fullName, category, consultDate) {
  const confirmationNumber = generateConfirmationNumber();
  const formattedDate = parseDateFromInput(consultDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  document.getElementById('ticket-number').textContent = confirmationNumber;
  document.getElementById('ticket-name').textContent = fullName;
  document.getElementById('ticket-category').textContent = category;
  document.getElementById('ticket-date').textContent = formattedDate;
  
  ticketStub.classList.remove('hidden');
  ticketStub.scrollIntoView({ behavior: 'smooth' });
}

function validateBooking(dateString) {
  const formattedDate = formatDate(dateString);
  const selectedDate = parseDateFromInput(formattedDate);
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

  return { formattedDate, reason };
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

  if (!fullName || !age || !rank || !reason || !consultDate) {
    showStatus('Please fill in all required fields before submitting.', 'error');
    return;
  }

  const { formattedDate, reason: validationErrors } = validateBooking(consultDate);
  if (validationErrors.length) {
    showStatus(validationErrors.join(' '), 'error');
    return;
  }

  addBooking(formattedDate);
  const formattedDateDisplay = parseDateFromInput(formattedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  showStatus(`Booking accepted for ${formattedDateDisplay}.`, 'success');
  showTicketStub(fullName, rank, formattedDate);
  renderSummary();
  form.reset();
});

printButton.addEventListener('click', () => {
  window.print();
});

buildQrCode();
renderSummary();
