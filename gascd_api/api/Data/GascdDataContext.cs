using api.Data.Models.Metrics;
using api.Data.Models.Metrics.TimeSeries;
using api.Data.Models.Reference;
using api.Data.Shared;
using api.Endpoints.Metrics.Data;
using Microsoft.EntityFrameworkCore;
using static api.Data.Shared.MetricCodeEnum;

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
    public virtual DbSet<NumClientsLongTermSupport> NumClientsLongTermSupportSet { get; set; } = null!;
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

    public IQueryable<MetricTimeSeries> GetMetricTimeSeriesQueryable(MetricCodeEnum metricCode)
    {
        switch (metricCode)
        {
            case bedcount_total:
                return BedcountSet.AsQueryable();
            case bedcount_per_hundred_thousand_adults:
            case bedcount_per_hundred_thousand_adults_dementia_nursing:
            case bedcount_per_hundred_thousand_adults_dementia_residential:
            case bedcount_per_hundred_thousand_adults_general_nursing:
            case bedcount_per_hundred_thousand_adults_general_residential:
            case bedcount_per_hundred_thousand_adults_learning_disability_nursing:
            case bedcount_per_hundred_thousand_adults_learning_disability_residential:
            case bedcount_per_hundred_thousand_adults_mental_health_nursing:
            case bedcount_per_hundred_thousand_adults_mental_health_residential:
            case bedcount_per_hundred_thousand_adults_transitional:
            case bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled:
                return BedcountPerHundredThousandAdultsSet.AsQueryable();
            case dementia_estimated_diagnosis_rate_65over:
                return DementiaEstimatedDiagnosisRate65OverSet.AsQueryable();
            case dementia_prevalence_65over:
                return DementiaPrevalence65OverSet.AsQueryable();
            case dementia_qof_prevalence:
                return DementiaQOFPrevalenceSet.AsQueryable();
            case dementia_register_65over_per100k:
                return DementiaRegister65OverPer100kSet.AsQueryable();
            case learning_disability_prevalence:
                return LearningDisabilityPrevalenceSet.AsQueryable();
            case median_bed_count_total:
                return MedianBedCountSet.AsQueryable();
            case median_occupancy_total:
                return MedianOccupancySet.AsQueryable();
            case occupancy_rate_total:
                return OccupancyRateSet.AsQueryable();
            case perc_18_64:
                return Perc1864Set.AsQueryable();
            case perc_65over:
                return Perc65OverSet.AsQueryable();
            case perc_75over:
                return Perc75OverSet.AsQueryable();
            case perc_85over:
                return Perc85OverSet.AsQueryable();
            case perc_general_health:
                return PercGeneralHealthSet.AsQueryable();
            case perc_household_ownership:
                return PercHouseholdOwnershipSet.AsQueryable();
            case perc_households_deprivation_deprived:
                return PercHouseholdsDeprivationDeprivedSet.AsQueryable();
            case perc_households_one_person:
                return PercHouseholdsOnePersonSet.AsQueryable();
            case perc_population_disability:
                return PercPopulationDisabilitySet.AsQueryable();
            case perc_unpaid_care_provider:
                return PercUnpaidCareProviderSet.AsQueryable();
            case total_population:
                return TotalPopulationSet.AsQueryable();
            default:
                throw new ArgumentException();
        }
    }

}