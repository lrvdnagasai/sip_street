/**
 * Utility to convert an array of JSON objects into a downloadable CSV file.
 * @param {Array<Object>} data - Array of plain objects
 * @param {string} filename - Target filename (e.g. "Sales_Report.csv")
 */
export function exportToCSV(data, filename = 'report.csv') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.map((h) => `"${h.replace(/_/g, ' ').toUpperCase()}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // Construct CSV blob and trigger browser download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
