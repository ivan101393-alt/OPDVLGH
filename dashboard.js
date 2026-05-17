// The shared Sheets web app URL is configured in sheet_config.js

const summaryElement = document.getElementById('dashboard-summary');
const tableBody = document.getElementById('patient-table-body');
const errorBox = document.getElementById('dashboard-error');

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function parseDateFromInput(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(dateString) {
  if (!dateString) return '';
  const date = parseDateFromInput(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

function renderSummary(summary) {
  summaryElement.innerHTML = `
    <ul>
      <li><strong>Total records:</strong> ${summary.totalRecords}</li>
      <li><strong>Accepted:</strong> ${summary.totalAccepted}</li>
      <li><strong>Rejected:</strong> ${summary.totalRejected}</li>
      <li><strong>Bookings by date:</strong> ${summary.dates.map(item => `${item.date} (${item.weekday}): ${item.count}`).join(', ')}</li>
      <li><strong>Bookings by category:</strong> ${summary.categories.map(item => `${item.category}: ${item.count}`).join(', ')}</li>
    </ul>
  `;
}

function renderPatients(patients) {
  if (!patients.length) {
    tableBody.innerHTML = '<tr><td colspan="9">No patient bookings found.</td></tr>';
    return;
  }

  tableBody.innerHTML = patients.map((record) => {
    const weekday = record.ConsultDate ? formatDateLabel(record.ConsultDate).split(',')[0] : '';
    return `
      <tr>
        <td>${record.Timestamp || ''}</td>
        <td>${record.FullName || ''}</td>
        <td>${record.Age || ''}</td>
        <td>${record.Category || ''}</td>
        <td>${record.ConsultDate || ''}</td>
        <td>${weekday}</td>
        <td>${record.Comorbidities || ''}</td>
        <td>${record.Status || ''}</td>
        <td>${record.ConfirmationNumber || ''}</td>
      </tr>
    `;
  }).join('');
}

async function loadDashboard() {
  hideError();

  if (!SHEETS_WEB_APP_URL) {
    showError('Google Sheets web app URL is not configured in dashboard.js.');
    summaryElement.innerHTML = '<p>Configure the web app URL and reload.</p>';
    tableBody.innerHTML = '<tr><td colspan="9">No data available.</td></tr>';
    return;
  }

  try {
    const summaryData = await fetchJson(`${SHEETS_WEB_APP_URL}?action=summary`);
    const patientData = await fetchJson(`${SHEETS_WEB_APP_URL}?action=patients`);
    renderSummary(summaryData);
    renderPatients(patientData.patients || []);
  } catch (error) {
    showError(error.message);
    summaryElement.innerHTML = '<p>Unable to load dashboard data.</p>';
    tableBody.innerHTML = '<tr><td colspan="9">Unable to load patient records.</td></tr>';
  }
}

loadDashboard();
