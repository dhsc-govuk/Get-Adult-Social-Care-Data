namespace api.Endpoints.Metrics.Data;

public class GetMetricResponse
{
    public required string MetricCode { get; set; }
    public required string LocationCode { get; set; }
    public required string LocationType { get; set; }
    public DateTime? SeriesStartDate { get; set; }
    public required DateTime SeriesEndDate { get; set; }
    public required string SeriesFrequency { get; set; }
    public required decimal?[] Values { get; set; }
}