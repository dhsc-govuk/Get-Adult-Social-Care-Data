using api.Data;
using Microsoft.EntityFrameworkCore;

namespace api.Configuration;

public static class DatabaseConfiguration
{
    public static IServiceCollection RegisterDatabase(this IServiceCollection services, IConfiguration config)
    {
        return services.AddDbContext<GascdDataContext>(o =>
            o.UseNpgsql(config.GetConnectionString("DefaultConnection")));
    }
}