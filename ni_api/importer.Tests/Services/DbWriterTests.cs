using core.Data;
using core.Reader;
using importer.Services;
using importer.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;


namespace importer.Tests.Services;

public class DbWriterTests : IClassFixture<DatabaseFixture>
{
    private DatabaseFixture _fixture;
    private DbWriter _writer;

    public DbWriterTests(DatabaseFixture fixture)
    {
        _fixture =  fixture;
        var context = GetContext();
        context.Database.EnsureCreated();
        var services = new ServiceCollection();
        services.AddSingleton<NiDataContext>(o => context);
        _writer = new DbWriter(services.BuildServiceProvider());
    }

    private NiDataContext GetContext()
    {
        var options = new DbContextOptionsBuilder<NiDataContext>()
            .UseSqlServer(_fixture.GetConnectionString())
            .Options;
        
        return new NiDataContext(options);
    }

    [Fact]
    public void CanWriteToDatabase()
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
         
         
         _writer.WriteContact(cr);
         
         var context = GetContext();
         
        context.Locations.Count().ShouldBe(1);
        context.Users.Count().ShouldBe(1);
        context.Roles.Count().ShouldBe(1);
    }
}