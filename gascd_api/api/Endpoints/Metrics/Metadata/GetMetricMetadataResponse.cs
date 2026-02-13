namespace api.Endpoints.Metrics.Metadata;

public class GetMetricMetadataResponse
{
    public required string MetricCode { get; init; }
    public required string MetricName { get; init; }
    public required string FilterType { get; init; }
    public required string DataType { get; init; }
    public required string DataSource { get; init; }
    public required string Numerator { get; init; }
    public required string Denominator { get; init; }
}