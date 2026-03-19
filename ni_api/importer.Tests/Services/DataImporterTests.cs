using importer.Services;
using Shouldly;

namespace DefaultNamespace;

public class DataImporterTests
{
    [Fact]
    public void TestImport()
    {
        DataImporter dataImporter = new DataImporter();
        dataImporter.ShouldNotBeNull();
    }
}