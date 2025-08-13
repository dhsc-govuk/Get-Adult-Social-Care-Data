const createCSVHeaders = (dataRows: any[], xLabel: string): string => {
  const headers = Object.keys(dataRows[0])
    .filter((key) => key !== 'metric')
    .map((key) => (key === 'xAxisValue' ? xLabel : key));
  return headers.join(',') + '\r\n';
};

export function generateCSVRows(dataRows: any[]): string {
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

export function createCSVBlob(csvData: string): Blob {
  return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
}

export function createDownloadLink(
  blob: Blob,
  filename: string
): HTMLAnchorElement {
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = filename;
  downloadLink.style.visibility = 'hidden';
  return downloadLink;
}

export function initiateDownload(downloadLink: HTMLAnchorElement) {
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

export function convertToCSV(dataRows: any[], xLabel: string): string {
  let csvContent = '';
  if (xLabel) {
    csvContent += createCSVHeaders(dataRows, xLabel);
  }
  csvContent += generateCSVRows(dataRows);
  return csvContent;
}

export function downloadCSV(data: any[], filename: string, xLabel: string) {
  const csvData = convertToCSV(data, xLabel);
  const csvBlob = createCSVBlob(csvData);
  const downloadLink = createDownloadLink(csvBlob, filename);
  initiateDownload(downloadLink);
}
