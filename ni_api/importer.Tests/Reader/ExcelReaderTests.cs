using importer.Reader;
using Shouldly;
using System;
using System.Collections.Generic;
using System.IO;
using Xunit;

namespace importer.Tests.Reader;

public class ExcelReaderTests : IDisposable
{
    FileStream? _fileStream;

    [Fact]
    public void CanCreateExcelReader()
    {
        ExcelReader excelReader = new ExcelReader(GetTestFileStream());
        excelReader.ShouldNotBeNull();
    }

    [Fact]
    public void CanReadExcelFile_GetContacts()
    {
        var expectedRows = new List<ContactRow>
        {
            new() { LocationId = "1-10000302982", LocationName = "My Organisation", LocationType = "Location", Role = "Registered Manager", Name = "Mr Test Person", Email = "test@testing.com"},
            new() { LocationId = "1-10000302983", LocationName = "My Other Organisation", LocationType = "Location", Role = "Nominated Individual", Name = "Mrs Testy Person", Email = "testy@testing.com"},
        };
        ExcelReader excelReader = new ExcelReader(GetTestFileStream());
        var rows = excelReader.ProcessFile();
        rows.ShouldBe(expectedRows);
    }

    private FileStream GetTestFileStream()
    {
        _fileStream = File.Open("TestData/test_ni_list.xlsx", FileMode.Open, FileAccess.Read);
        return _fileStream;
    }

    public void Dispose()
    {
        _fileStream?.Dispose();
    }
}
