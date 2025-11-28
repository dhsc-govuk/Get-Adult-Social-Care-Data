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

    public virtual DbSet<PostcodeDatum> PostcodeData { get; set; } = null!;
    public virtual DbSet<CareProvider> CareProviders { get; set; } = null!;

}