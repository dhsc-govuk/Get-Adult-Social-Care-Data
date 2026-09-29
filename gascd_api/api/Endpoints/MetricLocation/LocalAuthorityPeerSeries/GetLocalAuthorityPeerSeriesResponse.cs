namespace api.Endpoints.MetricLocation.LocalAuthorityPeerSeries;

/// <summary>
/// The average of a metric's time series across a local authority's statistical peers,
/// in the same shape as a single location's series from the metric data endpoint.
/// </summary>
public class GetLocalAuthorityPeerSeriesResponse
{
    public required string MetricCode { get; init; }

    /// <summary>Peers whose series contributed to the average.</summary>
    public required int PeerCount { get; init; }

    public required DateOnly SeriesStartDate { get; init; }
    public required DateOnly SeriesEndDate { get; init; }
    public required string SeriesFrequency { get; init; }

    /// <summary>Mean of the peers' values at each point, null where no peer has a value.</summary>
    public required decimal?[] Values { get; init; }
}
