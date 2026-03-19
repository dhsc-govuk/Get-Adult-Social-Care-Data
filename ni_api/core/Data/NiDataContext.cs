using core.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace core.Data;

public class NiDataContext : DbContext
{
    public NiDataContext()
    {
    }

    public NiDataContext(DbContextOptions<NiDataContext> options)
        : base(options)
    {
    }
    
     public virtual DbSet<Location> Locations { get; set; }
     public virtual DbSet<User> Users { get; set; }
     public virtual DbSet<Role> Roles { get; set; }
}