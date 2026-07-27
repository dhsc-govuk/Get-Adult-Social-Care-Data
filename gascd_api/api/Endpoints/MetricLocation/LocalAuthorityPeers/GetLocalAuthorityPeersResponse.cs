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

    public required decimal? AveragePeerGroup { get; init; }

    public required decimal? NationalAverage { get; init; }

}

