using Testcontainers.PostgreSql;

namespace api.Tests.Fixtures;

public class IntegrationTestFixture : IAsyncLifetime
{
    public required PostgreSqlContainer PostgresContainer { get; set; }

    public async ValueTask InitializeAsync()
    {
        PostgresContainer = new PostgreSqlBuilder()
            .WithDatabase("gascd_data")
            .WithImage("postgres:17.6")
            .WithResourceMapping("TestData/test-seed.sql", "/docker-entrypoint-initdb.d/")
            .Build();

        await PostgresContainer.StartAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await PostgresContainer.DisposeAsync();

    }
}