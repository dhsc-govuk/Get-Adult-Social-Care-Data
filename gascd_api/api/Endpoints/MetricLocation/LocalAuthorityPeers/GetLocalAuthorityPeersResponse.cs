namespace api.Endpoints.MetricLocation.LocalAuthorityPeers;

public class GetLocalAuthorityPeersResponse
{
    public record LocalAuthorityPeer
    {
        public required string Code { get; init; }
        public required string DisplayName { get; init; }
        public required int PeerRanking { get; init; }
        public decimal? MetricValue { get; init; }
    }
    public required List<LocalAuthorityPeer> LocalAuthorityPeers { get; init; }

    /// <summary>
    /// The peer group's value: the average of the members' values, except for CQC metrics, where location
    /// counts are the total and percentages are pooled from those totals.
    /// </summary>
    public required decimal? AveragePeerGroup { get; init; }

    public required decimal? NationalAverage { get; init; }

}

