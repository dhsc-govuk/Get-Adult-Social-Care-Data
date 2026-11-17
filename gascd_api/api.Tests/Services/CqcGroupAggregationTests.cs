using api.Data.Shared;
using api.Services;
using Shouldly;

namespace api.Tests.Services;

public class CqcGroupAggregationTests
{
    [Theory]
    [InlineData(MetricCodeEnum.cqcr_num_good_care_home)]
    [InlineData(MetricCodeEnum.cqci_num_total_adult_social_care)]
    [InlineData(MetricCodeEnum.cqci_num_uninspected_supported_living)]
    public void For_CqcCount_IsSum(MetricCodeEnum metricCode)
    {
        CqcGroupAggregation.For(metricCode).ShouldBeOfType<CqcGroupAggregation.Sum>();
    }

    [Theory]
    [InlineData(MetricCodeEnum.cqcr_pct_inspected_good_adult_social_care,
        MetricCodeEnum.cqcr_num_good_adult_social_care, MetricCodeEnum.cqci_num_inspected_adult_social_care)]
    [InlineData(MetricCodeEnum.cqcr_pct_all_requires_improvement_care_home_nursing,
        MetricCodeEnum.cqcr_num_requires_improvement_care_home_nursing, MetricCodeEnum.cqci_num_total_care_home_nursing)]
    [InlineData(MetricCodeEnum.cqcr_pct_inspected_insufficient_evidence_other_community_care,
        MetricCodeEnum.cqcr_num_insufficient_evidence_other_community_care, MetricCodeEnum.cqci_num_inspected_other_community_care)]
    [InlineData(MetricCodeEnum.cqci_pct_inspected_domiciliary_care,
        MetricCodeEnum.cqci_num_inspected_domiciliary_care, MetricCodeEnum.cqci_num_total_domiciliary_care)]
    [InlineData(MetricCodeEnum.cqci_pct_uninspected_extra_care_housing,
        MetricCodeEnum.cqci_num_uninspected_extra_care_housing, MetricCodeEnum.cqci_num_total_extra_care_housing)]
    public void For_CqcPercentage_IsPooledFromItsCounts(
        MetricCodeEnum metricCode, MetricCodeEnum numerator, MetricCodeEnum denominator)
    {
        CqcGroupAggregation.For(metricCode).ShouldBe(new CqcGroupAggregation.Pooled(numerator, denominator));
    }

    [Fact]
    public void For_EveryCqcMetric_HasARule()
    {
        var cqcCodes = Enum.GetValues<MetricCodeEnum>()
            .Where(x => x.ToString().StartsWith("cqcr_") || x.ToString().StartsWith("cqci_"))
            .ToList();

        cqcCodes.Count.ShouldBe(180);
        cqcCodes.Where(x => CqcGroupAggregation.For(x) is null).ShouldBeEmpty();
    }

    [Theory]
    [InlineData(MetricCodeEnum.perc_households_one_person)]
    [InlineData(MetricCodeEnum.npl_adult_social_care)]
    public void For_OtherMetric_IsNull(MetricCodeEnum metricCode)
    {
        CqcGroupAggregation.For(metricCode).ShouldBeNull();
    }

    [Fact]
    public void Pool_RoundsHalfAwayFromZero_AndIsNullWithoutADenominator()
    {
        CqcGroupAggregation.Pool(354m, 480m).ShouldBe(73.8m);
        CqcGroupAggregation.Pool(1m, 8m).ShouldBe(12.5m);
        CqcGroupAggregation.Pool(0m, 0m).ShouldBeNull();
    }
}
