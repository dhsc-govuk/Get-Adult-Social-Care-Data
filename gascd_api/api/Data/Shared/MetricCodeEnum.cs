using api.Data.Models.Metrics.TimeSeries;
using System.Reflection;
using static api.Data.Shared.MetricCodeEnum;

namespace api.Data.Shared;

public enum MetricCodeEnum
{
    [MyType(typeof(Bedcount))]
    bedcount_total,
    bedcount_per_hundred_thousand_adults_total,
    bedcount_per_hundred_thousand_adults_total_dementia_nursing,
    bedcount_per_hundred_thousand_adults_total_dementia_residential,
    bedcount_per_hundred_thousand_adults_total_general_nursing,
    bedcount_per_hundred_thousand_adults_total_general_residential,
    bedcount_per_hundred_thousand_adults_total_learning_disability_nursing,
    bedcount_per_hundred_thousand_adults_total_learning_disability_residential,
    bedcount_per_hundred_thousand_adults_total_mental_health_nursing,
    bedcount_per_hundred_thousand_adults_total_mential_health_residential,
    bedcount_per_hundred_thousand_adults_total_transitional,
    bedcount_per_hundred_thousand_adults_total_ypd_young_physically_disabled,
    dementia_estimated_diagnosis_rate_65over,
    dementia_prevalence_65over,
    dementia_qof_prevalence,
    dementia_register_65over_per100k,
    learning_disability_prevalence,
    median_bed_count_total,
    median_occupancy_total,
    occupancy_rates_total,
    perc_18_64,
    perc_65over,
    perc_75over,
    perc_85over,
    perc_general_health_total,
    perc_household_ownership_total,
    perc_households_deprivation_deprived_total,
    perc_households_one_person_total,
    perc_population_disability_disabled_total,
    perc_unpaid_care_provider_total,
    total_population,
}

public static class MetricCodeEnumExtensions
{
    public static MetricGroupCodeEnum ToMetricGroupCode(this MetricCodeEnum metricCode)
    {
        switch (metricCode)
        {
            case bedcount_total:
                return MetricGroupCodeEnum.bedcount;
            case bedcount_per_hundred_thousand_adults_total:
            case bedcount_per_hundred_thousand_adults_total_dementia_nursing:
            case bedcount_per_hundred_thousand_adults_total_dementia_residential:
            case bedcount_per_hundred_thousand_adults_total_general_nursing:
            case bedcount_per_hundred_thousand_adults_total_general_residential:
            case bedcount_per_hundred_thousand_adults_total_learning_disability_nursing:
            case bedcount_per_hundred_thousand_adults_total_learning_disability_residential:
            case bedcount_per_hundred_thousand_adults_total_mental_health_nursing:
            case bedcount_per_hundred_thousand_adults_total_mential_health_residential:
            case bedcount_per_hundred_thousand_adults_total_transitional:
            case bedcount_per_hundred_thousand_adults_total_ypd_young_physically_disabled:
                return MetricGroupCodeEnum.bedcount_per_hundred_thousand_adults;
            case dementia_estimated_diagnosis_rate_65over:
                return MetricGroupCodeEnum.dementia_estimated_diagnosis_rate_65over;
            case dementia_prevalence_65over:
                return MetricGroupCodeEnum.dementia_prevalence_65over;
            case dementia_qof_prevalence:
                return MetricGroupCodeEnum.dementia_qof_prevalence;
            case dementia_register_65over_per100k:
                return MetricGroupCodeEnum.dementia_register_65over_per100k;
            case learning_disability_prevalence:
                return MetricGroupCodeEnum.learning_disability_prevalence;
            case median_bed_count_total:
                return MetricGroupCodeEnum.median_bed_count;
            case median_occupancy_total:
                return MetricGroupCodeEnum.median_occupancy;
            case occupancy_rates_total:
                return MetricGroupCodeEnum.occupancy_rates;
            case perc_18_64:
                return MetricGroupCodeEnum.perc_18_64;
            case perc_65over:
                return MetricGroupCodeEnum.perc_65over;
            case perc_75over:
                return MetricGroupCodeEnum.perc_75over;
            case perc_85over:
                return MetricGroupCodeEnum.perc_85over;
            case perc_general_health_total:
                return MetricGroupCodeEnum.perc_general_health;
            case perc_household_ownership_total:
                return MetricGroupCodeEnum.perc_household_ownership;
            case perc_households_deprivation_deprived_total:
                return MetricGroupCodeEnum.perc_households_deprivation_deprived;
            case perc_households_one_person_total:
                return MetricGroupCodeEnum.perc_households_one_person;
            case perc_population_disability_disabled_total:
                return MetricGroupCodeEnum.perc_population_disability;
            case perc_unpaid_care_provider_total:
                return MetricGroupCodeEnum.perc_unpaid_care_provider;
            case total_population:
                return MetricGroupCodeEnum.total_population;
            default:
                throw new ArgumentException();
        }
    }

    public static Type MyTypeOf(this MetricCodeEnum metricCode)
    {
        return metricCode.GetType().GetMember(metricCode.ToString()).First().GetCustomAttribute<MyTypeAttribute>().MyType;
    }
}