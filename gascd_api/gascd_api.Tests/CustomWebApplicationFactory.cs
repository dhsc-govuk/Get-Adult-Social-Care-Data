using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Testcontainers.PostgreSql;

namespace gascd_api.Tests;

internal class CustomWebAppFactory(PostgreSqlContainer container) : WebApplicationFactory<Program>
{
    protected override void ConfigureClient(HttpClient client)
    {
        client.DefaultRequestHeaders.Add("x-api-key", "test-secret-key");
        base.ConfigureClient(client);
    }
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, configBuilder) =>
        {
            var connStr = container.GetConnectionString();
            var inMemorySettings = new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connStr,
                ["Auth:ApiKey"] = "test-secret-key"
            };

            configBuilder.AddInMemoryCollection(inMemorySettings);
        });
    }
}