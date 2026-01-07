namespace api.Endpoints.Metrics;

public class GetMetricResponse
{
    public required string MetricCode { get; set; }
    public required string LocationCode { get; set; }
    public required string LocationType { get; set; }

}