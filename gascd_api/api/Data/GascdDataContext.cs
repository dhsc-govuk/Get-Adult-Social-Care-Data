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
        return metricCode switch
        {
            bedcount_total => BedcountSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total => BedcountPerHundredThousandAdultsSet.AsQueryable(),

            bedcount_per_hundred_thousand_adults_total_dementia_nursing => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_dementia_residential => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_general_nursing => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_general_residential => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_learning_disability_nursing => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_learning_disability_residential => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_mental_health_nursing => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_mential_health_residential => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_transitional => BedcountPerHundredThousandAdultsSet.AsQueryable(),
            bedcount_per_hundred_thousand_adults_total_ypd_young_physically_disabled => BedcountPerHundredThousandAdultsSet.AsQueryable(),


            dementia_estimated_diagnosis_rate_65over => DementiaEstimatedDiagnosisRate65OverSet.AsQueryable(),
            dementia_prevalence_65over => DementiaPrevalence65OverSet.AsQueryable(),
            dementia_qof_prevalence => DementiaQOFPrevalenceSet.AsQueryable(),
            dementia_register_65over_per100k => DementiaRegister65OverPer100kSet.AsQueryable(),
            learning_disability_prevalence => LearningDisabilityPrevalenceSet.AsQueryable(),
            median_bed_count_total => MedianBedCountSet.AsQueryable(),
            median_occupancy_total => MedianOccupancySet.AsQueryable(),
            occupancy_rates_total => OccupancyRateSet.AsQueryable(),
            perc_18_64 => Perc1864Set.AsQueryable(),
            perc_65over => Perc65OverSet.AsQueryable(),
            perc_75over => Perc75OverSet.AsQueryable(),
            perc_85over => Perc85OverSet.AsQueryable(),
            perc_general_health_total => PercGeneralHealthSet.AsQueryable(),
            perc_household_ownership_total => PercHouseholdOwnershipSet.AsQueryable(),
            perc_households_deprivation_deprived_total => PercHouseholdsDeprivationDeprivedSet.AsQueryable(),
            perc_households_one_person_total => PercHouseholdsOnePersonSet.AsQueryable(),
            perc_population_disability_disabled_total => PercPopulationDisabilitySet.AsQueryable(),
            perc_unpaid_care_provider_total => PercUnpaidCareProviderSet.AsQueryable(),
            total_population => TotalPopulationSet.AsQueryable(),
            _ => throw new ArgumentException()
        };
    }

}