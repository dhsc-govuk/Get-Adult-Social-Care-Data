using Testcontainers.MsSql;

namespace importer.Tests.Fixtures;

public class DatabaseFixture : IAsyncLifetime
{
    public required MsSqlContainer Container { get; set; }

    public async ValueTask InitializeAsync()
    {
        Container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2025-latest")
            .WithHostname("importer")
            .WithName("importer")
            .Build();

        await Container.StartAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await Container.StopAsync();
    }
    
    public string GetConnectionString()
    {
        return Container.GetConnectionString().Replace("Database=master", "Database=ni_data");
    }  
}