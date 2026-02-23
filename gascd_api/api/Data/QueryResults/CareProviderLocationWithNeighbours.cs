namespace api.Data.QueryResults;

public class CareProviderLocationWithNeighbours
{
    public required string LocationCode;

    public required List<CareProviderLocationNeighbour> Neighbours;
}