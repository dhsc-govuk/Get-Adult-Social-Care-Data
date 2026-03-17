using DocumentFormat.OpenXml.Packaging;

namespace core.Reader;

public class ExcelReader
{
    private SpreadsheetDocument _document;
    
    public ExcelReader(FileStream stream)
    {
        _document = SpreadsheetDocument.Open(stream, false);
    }

    public int? GetSheetCount()
    {
        return _document.WorkbookPart?.WorksheetParts?.Count();
    }
}