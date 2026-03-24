using core.Data;
using core.Reader;
using importer.Services;
using importer.Tests.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;


namespace importer.Tests.Services;

public class DbWriterTests : IClassFixture<DatabaseFixture>, IDisposable
{
    private DatabaseFixture _fixture;
    private DbWriter _writer;

    public DbWriterTests(DatabaseFixture fixture)
    {
        _fixture =  fixture;
        var context = GetContext();
        context.Database.EnsureDeleted();
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
    public void CanWriteContactRowToDatabase()
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
    
    [Fact]
    public void CanWriteOtherContactRowToDatabase()
    {
        var cr = new ContactRow
        {
            LocationId = "1-10000302983",
            LocationName = "My Other Organisation",
            LocationType = "Location",
            Role = "Registered Manager",
            Name = "Ms Caroline Cheeseman",
            Email = "caroline@cheeseman.com"
        };
        
        _writer.WriteContact(cr);
         
        var context = GetContext();
         
        context.Locations.Count().ShouldBe(1);
        context.Users.Count().ShouldBe(1);
        context.Roles.Count().ShouldBe(1);
    }

    public void Dispose()
    {
        var context = GetContext();
        context.Database.EnsureDeleted();
    }
}