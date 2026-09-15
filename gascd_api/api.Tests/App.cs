using FastEndpoints.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Testcontainers.PostgreSql;

namespace api.Tests;

public class App : AppFixture<Program>
{
    public required PostgreSqlContainer PostgresContainer { get; set; }

    protected override async ValueTask PreSetupAsync()
    {
        PostgresContainer = new PostgreSqlBuilder("postgis/postgis:18-3.6-alpine")
            .WithDatabase("gascd_data")
            .WithResourceMapping("TestData/test-seed.sql", "/docker-entrypoint-initdb.d/")
            .Build();

        await PostgresContainer.StartAsync();
    }

    protected override ValueTask SetupAsync()
    {
        Client.DefaultRequestHeaders.Add("x-api-key", "test-secret-key");
        return ValueTask.CompletedTask;
    }

    protected override void ConfigureApp(IWebHostBuilder a)
    {
        a.ConfigureAppConfiguration((_, configBuilder) =>
        {
            var connStr = PostgresContainer.GetConnectionString();
            var inMemorySettings = new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connStr,
                ["AuthApiKey"] = "test-secret-key",
            };
            configBuilder.AddInMemoryCollection(inMemorySettings);
        });
    }
}