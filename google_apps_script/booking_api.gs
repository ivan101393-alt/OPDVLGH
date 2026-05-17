const SHEET_NAME = 'Bookings';
const HEADERS = [
  'Timestamp',
  'FullName',
  'Age',
  'Category',
  'Reason',
  'Comorbidities',
  'ConsultDate',
  'Status',
  'ConfirmationNumber'
];

function doGet(e) {
  const action = e.parameter.action || 'patients';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ error: 'Sheet not found' }, 400);
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) {
    return jsonResponse(action === 'summary' ? createSummary([]) : { patients: [] });
  }

  const headers = rows.shift();
  const records = rows.map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  });

  if (action === 'summary') {
    return jsonResponse(createSummary(records));
  }

  if (action === 'patients') {
    return jsonResponse({ patients: records });
  }

  return jsonResponse({ error: 'Invalid action' }, 400);
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (error) {
    payload = e.parameter;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ error: 'Sheet not found' }, 400);
  }

  const row = HEADERS.map((header) => payload[header] || '');
  sheet.appendRow(row);

  return jsonResponse({ success: true, record: payload });
}

function createSummary(records) {
  const totalRecords = records.length;
  const totalAccepted = records.filter((r) => r.Status === 'ACCEPTED').length;
  const totalRejected = records.filter((r) => r.Status === 'REJECTED').length;

  const dates = {};
  const categories = {};

  records.forEach((record) => {
    const date = record.ConsultDate || 'Unknown';
    dates[date] = (dates[date] || 0) + 1;
    const category = record.Category || 'Unknown';
    categories[category] = (categories[category] || 0) + 1;
  });

  return {
    totalRecords,
    totalAccepted,
    totalRejected,
    dates: Object.keys(dates).sort().map((date) => ({ date, count: dates[date], weekday: getWeekdayLabel(date) })),
    categories: Object.keys(categories).map((category) => ({ category, count: categories[category] })),
  };
}

function getWeekdayLabel(dateString) {
  if (!dateString) return 'Unknown';
  const parts = dateString.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function jsonResponse(data, status) {
  const response = ContentService.createTextOutput(JSON.stringify(data));
  response.setMimeType(ContentService.MimeType.JSON);
  if (status) {
    response.setResponseCode(status);
  }
  response.append('\n');
  return response;
}
