namespace api.Endpoints.Metrics;

public class GetMetricResponse
{
    public required string MetricCode { get; set; }
    public required string LocationCode { get; set; }
    public required string LocationType { get; set; }
    public required DateTime SeriesStartDate { get; set; }
    public required string SeriesFrequency { get; set; }
    public required decimal[] Values { get; set; }
}