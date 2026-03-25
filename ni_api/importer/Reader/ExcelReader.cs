using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

namespace importer.Reader;

public class ExcelReader(FileStream stream)
{
    private readonly SpreadsheetDocument _document = SpreadsheetDocument.Open(stream, false);

    public List<ContactRow> ProcessFile()
    {
        var worksheet = GetContactWorksheet();

        var headerDict = GetWorksheetHeaderDict(worksheet);
        
        return ProcessRows(headerDict, worksheet);
    }

    private Dictionary<int, string> GetWorksheetHeaderDict(Worksheet worksheet)
    {
        var headerRow = worksheet.Descendants<Row>().FirstOrDefault() ?? 
                        throw new InvalidOperationException("Unable to read header row from workbook");
        
        return GetColumnDict(headerRow);
    }

    private List<ContactRow> ProcessRows(Dictionary<int, string> headerDict, Worksheet worksheet)
    {
        return worksheet.Descendants<Row>().Skip(1).Select(row => ProcessRow(headerDict, row)).ToList();
    }

    private ContactRow ProcessRow(Dictionary<int, string> headerDict, Row row)
    {
        ContactRow contactRow = new();
        var idx = 0;
        foreach (Cell cell in row.Elements<Cell>())
        {
            if (headerDict.ContainsKey(idx))
            {
                var value = GetCellContent(cell);

                switch (headerDict[idx])
                {
                    case "location_id":
                        contactRow.LocationId = value;
                        break;
                    case "location_name":
                        contactRow.LocationName = value;
                        break;
                    case "location_type":
                        contactRow.LocationType = value;
                        break;
                    case "role":
                        contactRow.Role = value;
                        break;
                    case "name":
                        contactRow.Name = value;
                        break;
                    case "email":
                        contactRow.Email = value;
                        break;
                }
            }
            
            idx++;
        }
        
        return contactRow;
    }

    private Worksheet GetContactWorksheet()
    {
        var sheetId = _document.WorkbookPart?.Workbook?.Sheets?.Elements<Sheet>().FirstOrDefault(o => o.Name == "2 - Contacts")?.Id;

        if (sheetId == null || !sheetId.HasValue)
        {
            throw new InvalidOperationException("Unable to find Contacts worksheet");
        }

        var worksheet = ((WorksheetPart?)_document.WorkbookPart?.GetPartById(sheetId.Value!))?.Worksheet ??
                        throw new InvalidOperationException("Unable to find Contacts worksheet");
        
        return worksheet;
    }

    private Dictionary<int, string> GetColumnDict(Row row)
    {
        Dictionary<int, string> columnDict = new();
        int col = 0;

        foreach (Cell cell in row.Elements<Cell>())
        {
            var header = GetCellContent(cell);

            switch (header)
            {
                case "Organisation ID":
                    columnDict[col] = "location_id";
                    break;
                case "Organisation Name":
                    columnDict[col] = "location_name";
                    break;
                case "Organisation Sub Type":
                    columnDict[col] = "location_type";
                    break;
                case "Role":
                    columnDict[col] = "role";
                    break;
                case "Name":
                    columnDict[col] = "name";
                    break;
                case "Email Address":
                    columnDict[col] = "email";
                    break;
            }

            col++;
        }

        return columnDict;
    }

    private string GetCellContent(Cell cell)
    {
        var content = cell.InnerText;

        if (cell.DataType != null && cell.DataType.Value == CellValues.SharedString)
        {
            content = _document.WorkbookPart?.GetPartsOfType<SharedStringTablePart>().FirstOrDefault()?.SharedStringTable?
                .ElementAt(Int32.Parse(content)).InnerText;
        }

        return content ?? string.Empty;
    }
}