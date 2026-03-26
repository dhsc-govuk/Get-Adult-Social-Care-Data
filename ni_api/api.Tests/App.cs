using core.Data;
using core.Data.Models;
using FastEndpoints.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Testcontainers.MsSql;

namespace api.Tests;

public class App : AppFixture<Program>
{
    public required MsSqlContainer Container { get; set; }

    protected override async ValueTask PreSetupAsync()
    {
        Container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2025-latest")
            .WithHostname("api")
            .WithName("api")
            .Build();
        
        await Container.StartAsync();
    }

    protected override ValueTask SetupAsync()
    {
        SeedDatabase();
        
        return base.SetupAsync();
    }

    protected override void ConfigureApp(IWebHostBuilder a)
    {
        a.ConfigureAppConfiguration((_, builder) =>
        {
            Dictionary<string, string?> inMemorySettings = new()
            {
                ["ConnectionStrings:DefaultConnection"] = GetConnectionString(),
            };
            builder.AddInMemoryCollection(inMemorySettings);
        });
    }

    private string GetConnectionString()
    {
        return Container.GetConnectionString().Replace("Database=master", "Database=ni_data");
    }

    private void SeedDatabase()
    {
        var context = GetContext();
        context.Database.EnsureCreated();

        User user1 = new() { Name = "Ms Caroline Cheeseman", Email = "caroline@cheeseman.com" };
        User user2 = new() { Name = "Mr Charles Cheeseman", Email = "charles@cheeseman.com" };

        Location location1 = new() { Code = "1-12345", Name = "Fun place", Type = "Location" };
        Location location2 = new() { Code = "1-12346", Name = "Sad place", Type = "Location" };
        Location location3 = new() { Code = "1-54321", Name = "Mad place", Type = "Location" };
        
        Role role1 = new() { RoleType = "Nominated Individual", Location = location1, User =  user1 };
        Role role2 = new() { RoleType = "Registered Manager", Location = location2, User =  user1 };
        Role role3 = new() { RoleType = "Nominated Individual", Location = location3, User =  user2 };

        context.Users.AddRange(user1, user2);
        context.Locations.AddRange(location1, location2, location3);
        context.Roles.AddRange(role1, role2, role3);
        
        context.SaveChanges();
    }
    
    private NiDataContext GetContext()
    {
        var options = new DbContextOptionsBuilder<NiDataContext>()
            .UseSqlServer(GetConnectionString())
            .Options;
        
        return new NiDataContext(options);
    }
}

