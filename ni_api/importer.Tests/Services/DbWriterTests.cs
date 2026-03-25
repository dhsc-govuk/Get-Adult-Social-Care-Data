using core.Data;
using importer.Reader;
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
        
         _writer.WriteContacts(new List<ContactRow>{ cr });
         
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
        
        _writer.WriteContacts(new List<ContactRow>{ cr });
         
        var context = GetContext();
         
        context.Locations.Count().ShouldBe(1);
        var location = context.Locations.First();
        location.Code.ShouldBe("1-10000302983");
        location.Name.ShouldBe("My Other Organisation");
        location.Type.ShouldBe("Location");
        
        context.Users.Count().ShouldBe(1);
        var user = context.Users.First();
        user.Name.ShouldBe("Ms Caroline Cheeseman");
        user.Email.ShouldBe("caroline@cheeseman.com");
        context.Roles.Count().ShouldBe(1);
        
        var role = context.Roles.First();
        role.RoleType.ShouldBe("Registered Manager");
        role.Location.ShouldBe(location);
        role.User.ShouldBe(user);
    }

    [Fact]
    public void CanWriteMultipleContactsToDatabase()
    {
        var crList = new List<ContactRow>
        {
            new()
            {
                LocationId = "1-10000302983",
                LocationName = "My Other Organisation",
                LocationType = "Location",
                Role = "Registered Manager",
                Name = "Ms Caroline Cheeseman",
                Email = "caroline@cheeseman.com"
            },
            new()
            {
                LocationId = "1-10000302984",
                LocationName = "That Work Place",
                LocationType = "Location",
                Role = "Nominated Individual",
                Name = "Mr Charles Cheeseman",
                Email = "charles@cheeseman.com"
            }
        };
        
        _writer.WriteContacts(crList);
        
        var context = GetContext();
        context.Locations.Count().ShouldBe(2);
        context.Users.Count().ShouldBe(2);
        context.Roles.Count().ShouldBe(2);
    }
    
    [Fact]
    public void CanWriteMultipleContactsToDatabase_OneUser()
    {
        var crList = new List<ContactRow>
        {
            new()
            {
                LocationId = "1-10000302983",
                LocationName = "My Other Organisation",
                LocationType = "Location",
                Role = "Registered Manager",
                Name = "Ms Caroline Cheeseman",
                Email = "caroline@cheeseman.com"
            },
            new()
            {
                LocationId = "1-10000302984",
                LocationName = "That Work Place",
                LocationType = "Location",
                Role = "Nominated Individual",
                Name = "Ms Caroline Cheeseman",
                Email = "caroline@cheeseman.com"
            }
        };
        
        _writer.WriteContacts(crList);
        
        var context = GetContext();
        context.Locations.Count().ShouldBe(2);
        context.Users.Count().ShouldBe(1);
        context.Roles.Count().ShouldBe(2);
    }
    
    [Fact]
    public void CanWriteMultipleContactsToDatabase_OneLocation()
    {
        var crList = new List<ContactRow>
        {
            new()
            {
                LocationId = "1-10000302983",
                LocationName = "My Other Organisation",
                LocationType = "Location",
                Role = "Registered Manager",
                Name = "Mr Charles Cheeseman",
                Email = "charles@cheeseman.com"
            },
            new()
            {
                LocationId = "1-10000302983",
                LocationName = "My Other Organisation",
                LocationType = "Location",
                Role = "Nominated Individual",
                Name = "Ms Caroline Cheeseman",
                Email = "caroline@cheeseman.com"
            }
        };
        
        _writer.WriteContacts(crList);
        
        var context = GetContext();
        context.Locations.Count().ShouldBe(1);
        context.Users.Count().ShouldBe(2);
        context.Roles.Count().ShouldBe(2);
    }

    public void Dispose()
    {
        var context = GetContext();
        context.Database.EnsureDeleted();
    }
}