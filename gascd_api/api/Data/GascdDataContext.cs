using api.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public partial class GascdDataContext : DbContext
{
    public GascdDataContext()
    {
    }

    public GascdDataContext(DbContextOptions<GascdDataContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Postcode> PostcodeData { get; set; } = null!;
    public virtual DbSet<CareProvider> CareProviders { get; set; } = null!;
    public virtual DbSet<CareProviderLocation> CareProviderLocations { get; set; } = null!;
    public virtual DbSet<Region> Regions { get; set; } = null!;
    public virtual DbSet<Country> Countries { get; set; } = null!;
    public virtual DbSet<LocalAuthority> LocalAuthorities { get; set; } = null!;
}