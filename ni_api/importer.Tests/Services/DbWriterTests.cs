using core.Reader;
using importer.Services;


namespace importer.Tests.Services;

public class DbWriterTests(DbWriter writer) : IClassFixture<App>
{
    [Fact]
    public void CanSaveContactRow()
    {
        var cr = new ContactRow
        {
            LocationId = "1-10000302982",
            LocationName = "My Organisation",
            LocationType = "Location",
            Role = "Registered Manager",
            Name = "Mr Test Person",
            Email = "test@testing.com"
        };
        
        
        writer.WriteContact(cr);
    }
}