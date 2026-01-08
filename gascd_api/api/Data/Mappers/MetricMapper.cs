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
            MetricName = metric.DisplayName,
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
            MetricFilters = metricGroup.Metrics
                .Select(MetricToMetricFilterDto).ToList()
        };
    }

    private GetMetricFiltersResponse.MetricFilterDto MetricToMetricFilterDto(Metric metric)
    {
        return new GetMetricFiltersResponse.MetricFilterDto
        {
            MetricCode = metric.Code,
            DisplayName = metric.DisplayName
        };
    }

    public GetMetricResponse MetricTimeSeriesToGetMetricResponse(MetricTimeSeries mts)
    {
        return new GetMetricResponse
        {
            MetricCode = mts.Metric.Code,
            LocationCode = mts.LocationCode,
            LocationType = mts.LocationType,
            SeriesStartDate = mts.StartDate,
            SeriesFrequency = mts.Metric.Frequency,
            Values = [mts.LatestValue]
        };
    }
}