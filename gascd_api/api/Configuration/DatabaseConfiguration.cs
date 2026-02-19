using api.Data;
using Azure.Core;
using Azure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace api.Configuration;

public static class DatabaseConfiguration
{
    extension(IServiceCollection services)
    {
        public IServiceCollection RegisterDatabase(IConfiguration config)
        {
            string? clientId = config.GetValue<string>("MI_CLIENT_ID");

            return clientId == null ? services.RegisterDatabaseConnection(config) : services.RegisterManagedIdentityDatabaseConnection(config);
        }

        private IServiceCollection RegisterDatabaseConnection(IConfiguration config)
        {
            return services.AddDbContext<GascdDataContext>(o =>
                o.UseNpgsql(config.GetConnectionString("DefaultConnection"),
                    p => p.UseNetTopologySuite()));
        }

        private IServiceCollection RegisterManagedIdentityDatabaseConnection(IConfiguration config)
        {
            string? clientId = config.GetValue<string>("MI_CLIENT_ID");
            string? databaseHost = config.GetValue<string>("database_host");
            string? identityName = config.GetValue<string>("identity_name");

            if (clientId == null || databaseHost == null || identityName == null)
            {
                throw new InvalidOperationException("Missing required configuration values for Managed Identity database connection");
            }

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = databaseHost,
                Database = "gascd_data",
                Username = identityName,
                SslMode = SslMode.VerifyFull
            };

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
                o.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
            });
        }
    }
}