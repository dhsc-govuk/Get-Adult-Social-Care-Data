using api.Data.Models.Metrics;
using api.Endpoints.MetricFilters;
using api.Endpoints.Metrics.Data;
using api.Endpoints.Metrics.Metadata;

namespace api.Data.Mappers;

public class MetricMapper
{
    public GetMetricMetadataResponse MetricToGetMetricMetadataResponse(Metric metric)
    {
        return new GetMetricMetadataResponse
        {
            MetricCode = metric.Code,
            MetricName = metric.MetricGroup.DisplayName,
            FilterType = metric.FilterType,
            DataType = metric.DataType,
            DataSource = metric.DataSource,
            Numerator = metric.NumeratorDescription,
            Denominator = metric.DenominatorDescription,
        };
    }

    public GetMetricFiltersResponse MetricGroupToMetricFiltersResponse(MetricGroup metricGroup)
    {
        return new GetMetricFiltersResponse
        {
            MetricGroupCode = metricGroup.Code,
            MetricGroupDisplayName = metricGroup.DisplayName,
            MetricFilters = metricGroup.Metrics
                .Select(MetricToMetricFilterDto).ToList()
        };
    }

    private GetMetricFiltersResponse.MetricFilterDto MetricToMetricFilterDto(Metric metric)
    {
        return new GetMetricFiltersResponse.MetricFilterDto
        {
            MetricCode = metric.Code,
            FilterType = metric.FilterType,
        };
    }

    public GetMetricResponse MetricTimeSeriesToGetMetricResponse(MetricTimeSeries mts, bool includeTimeSeries)
    {
        return new GetMetricResponse
        {
            MetricCode = mts.Metric.Code,
            LocationCode = mts.LocationCode,
            LocationType = mts.LocationType,
            SeriesStartDate = includeTimeSeries ? mts.StartDate : null,
            SeriesEndDate = mts.EndDate,
            SeriesFrequency = mts.Metric.Frequency,
            Values = includeTimeSeries ? mts.TimeSeries : [mts.LatestValue]
        };
    }
}