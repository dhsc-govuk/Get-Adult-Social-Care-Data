using api.Data.Models.Metrics;
using api.Data.Models.Metrics.TimeSeries;
using api.Data.Models.Reference;
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

    public virtual DbSet<MetricGroup> MetricGroups { get; set; } = null!;
    public virtual DbSet<Metric> Metrics { get; set; } = null!;

    public virtual DbSet<Bedcount> BedcountSet { get; set; } = null!;
    public virtual DbSet<BedcountPerHundredThousandAdults> BedcountPerHundredThousandAdultsSet { get; set; } = null!;
    public virtual DbSet<DementiaEstimatedDiagnosisRate65Over> DementiaEstimatedDiagnosisRate65OverSet { get; set; } = null!;
    public virtual DbSet<DementiaPrevalence65Over> DementiaPrevalence65OverSet { get; set; } = null!;
    public virtual DbSet<DementiaQOFPrevalence> DementiaQOFPrevalenceSet { get; set; } = null!;
    public virtual DbSet<DementiaRegister65OverPer100k> DementiaRegister65OverPer100kSet { get; set; } = null!;
    public virtual DbSet<LearningDisabilityPrevalence> LearningDisabilityPrevalenceSet { get; set; } = null!;
    public virtual DbSet<MedianBedCount> MedianBedCountSet { get; set; } = null!;
    public virtual DbSet<MedianOccupancy> MedianOccupancySet { get; set; } = null!;
    public virtual DbSet<OccupancyRate> OccupancyRateSet { get; set; } = null!;
    public virtual DbSet<Perc65Over> Perc65OverSet { get; set; } = null!;
    public virtual DbSet<Perc75Over> Perc75OverSet { get; set; } = null!;
    public virtual DbSet<Perc85Over> Perc85OverSet { get; set; } = null!;
    public virtual DbSet<Perc1864> Perc1864Set { get; set; } = null!;
    public virtual DbSet<PercGeneralHealth> PercGeneralHealthSet { get; set; } = null!;
    public virtual DbSet<PercHouseholdOwnership> PercHouseholdOwnershipSet { get; set; } = null!;
    public virtual DbSet<PercHouseholdsDeprivationDeprived> PercHouseholdsDeprivationDeprivedSet { get; set; } = null!;
    public virtual DbSet<PercHouseholdsOnePerson> PercHouseholdsOnePersonSet { get; set; } = null!;
    public virtual DbSet<PercPopulationDisability> PercPopulationDisabilitySet { get; set; } = null!;
    public virtual DbSet<PercUnpaidCareProvider> PercUnpaidCareProviderSet { get; set; } = null!;
    public virtual DbSet<TotalPopulation> TotalPopulationSet { get; set; } = null!;

    public IQueryable<MetricTimeSeries> GetMetricTimeSeriesQueryable(string metricCode)
    {
        switch (metricCode)
        {
            case "bedcount":
                return BedcountSet.AsQueryable();
            case "median_bed_count":
                return MedianBedCountSet.AsQueryable();
            default:
                throw new ArgumentException();
        }
    }

}