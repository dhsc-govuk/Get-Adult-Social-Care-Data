using importer.Tests.Fixtures;
using Testcontainers.MsSql;

namespace importer.Tests;

public class App : IAsyncLifetime
{
    public MsSqlContainer Container { get; set; }
    
    public async ValueTask InitializeAsync()
    {
        Container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2025-latest")
            .Build();
        
        await Container.StartAsync();
        
        await using HostApplicationFactory<Program> hostApplicationFactory = new(configuration: builder =>
        {
            builder.UseSetting("ConnectionStrings:DefaultConnection", Container.GetConnectionString());
        });

        await hostApplicationFactory.RunHostAsync();
        
        hostApplicationFactory.Services
    }
    
    public async ValueTask DisposeAsync()
    {
        // TODO release managed resources here
    }
}