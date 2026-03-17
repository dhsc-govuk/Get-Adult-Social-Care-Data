using Shouldly;
using System;
using System.IO;
using Xunit;

namespace core.Tests.ExcelReader;

public class ExcelReaderTests : IDisposable
{
    FileStream _fileStream;

    [Fact]
    public void CanCreateExcelReader()
    {
        Reader.ExcelReader excelReader = new Reader.ExcelReader(GetTestFileStream());
        Assert.NotNull(excelReader);
    }

    [Fact]
    public void CanReadExcelFile()
    {
        Reader.ExcelReader excelReader = new Reader.ExcelReader(GetTestFileStream());
        int? sheetCount = excelReader.GetSheetCount();
        sheetCount.ShouldBe(3);
    }

    private FileStream GetTestFileStream()
    {
        _fileStream = File.Open("TestData/test_ni_list.xlsx", FileMode.Open, FileAccess.Read);
        return _fileStream;
    }

    public void Dispose()
    {
        if (_fileStream != null)
        {
            _fileStream.Dispose();
        }
    }
}
