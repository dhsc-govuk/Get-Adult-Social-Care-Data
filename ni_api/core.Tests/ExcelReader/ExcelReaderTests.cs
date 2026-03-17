using Xunit;

namespace core.Tests.ExcelReader;

public class ExcelReaderTests
{

    [Fact]
    public void CanCreateExcelReader()
    {
        Reader.ExcelReader excelReader = new Reader.ExcelReader();
        Assert.NotNull(excelReader);
    }
}
