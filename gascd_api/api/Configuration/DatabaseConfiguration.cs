using api.Data;
using Azure.Core;
using Azure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Configuration;

public static class DatabaseConfiguration
{
    public static IServiceCollection RegisterDatabase(this IServiceCollection services, IConfiguration config)
    {
        string? clientId = config.GetValue<string>("MI_CLIENT_ID");

        return clientId == null ? RegisterDatabaseConnection(services, config) : RegisterManagedIdentityDatabaseConnection(services, config);
    }

    private static IServiceCollection RegisterDatabaseConnection(this IServiceCollection services,
        IConfiguration config)
    {
        return services.AddDbContext<GascdDataContext>(o =>
            o.UseNpgsql(config.GetConnectionString("DefaultConnection"),
                p => p.UseNetTopologySuite()));
    }

    private static IServiceCollection RegisterManagedIdentityDatabaseConnection(IServiceCollection services,
        IConfiguration config)
    {
        Console.WriteLine("Using Managed Identity to configure PG");
        string? clientId = config.GetValue<string>("MI_CLIENT_ID");
        string? databaseHost = config.GetValue<string>("database_host");
        string? identityName = config.GetValue<string>("identity_name");

        if (clientId == null || databaseHost == null || identityName == null)
        {
            Console.WriteLine("Missing required configuration values for Managed Identity database connection");
            throw new InvalidOperationException("Missing required configuration values for Managed Identity database connection");
        }

        var builder = new NpgsqlConnectionStringBuilder();
        builder.Host = databaseHost;
        builder.Database = "gascd_data";
        builder.Username = identityName;
        builder.SslMode = SslMode.VerifyFull;

        var credentialOptions = new DefaultAzureCredentialOptions { ManagedIdentityClientId = clientId };

        var azureCredential = new DefaultAzureCredential(credentialOptions);

        return services.AddDbContext<GascdDataContext>(o =>
        {
            o.UseNpgsql(builder.ConnectionString, p =>
            {
                p.UseNetTopologySuite();
                p.ConfigureDataSource(q =>
                    q.UsePeriodicPasswordProvider(async (_, ct) =>
                        {
                            var context = new TokenRequestContext(
                                ["https://ossrdbms-aad.database.windows.net/.default"]
                            );

                            var result = await azureCredential.GetTokenAsync(context, ct);

                            return result.Token;
                        },
                        successRefreshInterval: TimeSpan.FromMinutes(45),
                        failureRefreshInterval: TimeSpan.FromSeconds(10)
                    )
                );
            });
        });
    }

}