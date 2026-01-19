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
        string? id = config.GetValue<string>("MI_ID");

        return id == null ? RegisterDatabaseConnection(services, config) : RegisterManagedIdentityDatabaseConnection(services, config);
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
        string? id = config.GetValue<string>("MI_ID");
        string? clientId = config.GetValue<string>("MI_CLIENT_ID");
        string? principalId = config.GetValue<string>("MI_PRINCIPAL_ID");
        string? tenantId = config.GetValue<string>("MI_TENANT_ID");

        string? databaseHost = config.GetValue<string>("database_host");
        string? identityName = config.GetValue<string>("identity_name");

        string connectionString =
            $"Host={databaseHost};Database=gascd_data;Username={identityName};Ssl Mode=VerifyFull;Trust Server Certificate=true";

        var credentialOptions = new DefaultAzureCredentialOptions { ManagedIdentityClientId = clientId };

        var azureCredential = new DefaultAzureCredential(credentialOptions);

        return services.AddSingleton<NpgsqlDataSource>(sp =>
        {
            var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);

            dataSourceBuilder.UsePeriodicPasswordProvider(
                async (settings, cancellationToken) =>
                {
                    var tokenContext = new TokenRequestContext(
                        ["https://ossrdbms-aad.database.windows.net/.default"]
                    );

                    var tokenResult = await azureCredential.GetTokenAsync(tokenContext, cancellationToken);

                    return tokenResult.Token;
                },
                successRefreshInterval: TimeSpan.FromMinutes(45),
                failureRefreshInterval: TimeSpan.FromSeconds(10)
            );
            return dataSourceBuilder.Build();
        });
    }
}