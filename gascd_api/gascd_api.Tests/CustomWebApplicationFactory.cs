using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Testcontainers.PostgreSql;

namespace gascd_api.Tests;

internal class CustomWebAppFactory : WebApplicationFactory<Program>
{
    private readonly PostgreSqlContainer _container;

    public CustomWebAppFactory(PostgreSqlContainer container)
    {
        _container = container;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, configBuilder) =>
        {
            var connStr = _container.GetConnectionString();
            var inMemorySettings = new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connStr
            };
            
            configBuilder.AddInMemoryCollection(inMemorySettings);
        });
    }

}