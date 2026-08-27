export function extractTableCellText(table: HTMLTableElement): string[][] {
  const rows = table.rows;
  const cellTexts: any[] = [];

  for (let row of rows) {
    const rowCells: string[] = [];
    for (let cell of row.cells) {
      rowCells.push(cell.textContent || '');
    }
    cellTexts.push(rowCells);
  }

  return cellTexts;
}

export function parseInputData(input: any): any[] {
  return typeof input !== 'object' ? JSON.parse(input) : input;
}

const createCSVHeaders = (dataRows: any[], xLabel: string): string => {
  const headers = Object.keys(dataRows[0])
    .filter((key) => key !== 'metric')
    .map((key) => (key === 'xAxisValue' ? xLabel : `"${key}"`));
  return headers.join(',') + '\r\n';
};

function generateCSVRows(dataRows: any[]): string {
  return (
    dataRows
      .map((dataRow) => {
        return Object.keys(dataRow)
          .filter((key) => key !== 'metric')
          .map((key) => `"${dataRow[key]}"`)
          .join(',');
      })
      .join('\r\n') + '\r\n'
  );
}

function createCSVBlob(csvData: string): Blob {
  return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
}

function createDownloadLink(blob: Blob, filename: string): HTMLAnchorElement {
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = filename;
  downloadLink.style.visibility = 'hidden';
  return downloadLink;
}

function initiateDownload(downloadLink: HTMLAnchorElement) {
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

/**
 * Usage guidance placed above the data, so the sharing rules for a metric travel
 * with the file once it leaves the service.
 */
function createCSVNotice(notice: string[]): string {
  if (!notice.length) return '';

  const rows = notice.map((line) => `"${line.replace(/"/g, '""')}"`);
  // Trailing blank row separates the guidance from the table headers
  return rows.join('\r\n') + '\r\n\r\n';
}

export function convertToCSV(
  dataRows: any[],
  xLabel: string,
  notice: string[] = []
): string {
  const parsedData = parseInputData(dataRows);
  let csvContent = createCSVNotice(notice);
  if (!(parsedData[0] instanceof Array)) {
    csvContent += createCSVHeaders(parsedData, xLabel);
  }

  csvContent += generateCSVRows(parsedData);
  return csvContent;
}

export function downloadCSV(
  data: any[],
  filename: string,
  xLabel: string,
  notice: string[] = []
) {
  const csvData = convertToCSV(data, xLabel, notice);
  const csvBlob = createCSVBlob(csvData);
  const downloadLink = createDownloadLink(csvBlob, filename);
  initiateDownload(downloadLink);
}
