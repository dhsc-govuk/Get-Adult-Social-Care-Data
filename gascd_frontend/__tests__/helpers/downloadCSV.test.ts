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

  it('should add headers if objects are used', () => {
    const mockstruct = [
      { Fruit: 'Apple', Cost: '1.00' },
      { Fruit: 'Pear', Cost: '2.00' },
    ];
    const csv = convertToCSV(mockstruct, '');
    expect(csv).toBe('"Fruit","Cost"\r\n"Apple","1.00"\r\n"Pear","2.00"\r\n');
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
