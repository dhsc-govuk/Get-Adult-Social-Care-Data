import {
  convertToCSV,
  extractTableCellText,
} from '@/helpers/downloadToCsvHelpers';

describe('convertToCSV', () => {
  it('should convert tabular data to CSV data', () => {
    const mocktable = [
      ['Fruit', 'Cost', 'Quant'],
      ['Apple', '1.50', '12'],
      ['Pear', '2.00', '3'],
    ];
    const csv = convertToCSV(mocktable, '');
    expect(csv).toBe(
      '"Fruit","Cost","Quant"\r\n"Apple","1.50","12"\r\n"Pear","2.00","3"\r\n'
    );
  });

  it('should cope with commas and quotes', () => {
    const mocktable = [["Fruit's", 'Cost,X', '"Quant"']];
    const csv = convertToCSV(mocktable, '');
    expect(csv).toBe('"Fruit\'s","Cost,X",""Quant""\r\n');
  });
});

describe('extractTableCellText', () => {
  it('should convert HTML tables to rows', () => {
    const mocktable_html =
      '<table><tr><th>Name</th><th>Genre</th></tr><tr><td>Scary Film</td><td>Horror</td></tr></table>';
    const tableElement = new DOMParser()
      .parseFromString(mocktable_html, 'text/html')
      .querySelector('table') as HTMLTableElement;
    const data = extractTableCellText(tableElement);
    expect(data).toStrictEqual([
      ['Name', 'Genre'],
      ['Scary Film', 'Horror'],
    ]);
  });
});
