using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace gascd_api;

public partial class GascdDataContext : DbContext
{
    public GascdDataContext()
    {
    }

    public GascdDataContext(DbContextOptions<GascdDataContext> options)
        : base(options)
    {
    }

    public virtual DbSet<PostcodeDatum> PostcodeData { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PostcodeDatum>(entity =>
        {
            entity.HasKey(e => e.SanitisedPostcode).HasName("postcode_data_pkey");

            entity.ToTable("postcode_data");

            entity.Property(e => e.SanitisedPostcode)
                .HasMaxLength(255)
                .HasColumnName("sanitised_postcode");
            entity.Property(e => e.DisplayPostcode)
                .HasMaxLength(255)
                .HasColumnName("display_postcode");
            entity.Property(e => e.LaCode)
                .HasMaxLength(255)
                .HasColumnName("la_code");
            entity.Property(e => e.Latitude).HasColumnName("latitude");
            entity.Property(e => e.Longitude).HasColumnName("longitude");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
