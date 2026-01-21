namespace api.Endpoints.Shared;

public class GeoDataDto
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public required List<CoordinateDto> Polygon { get; init; } = new();

    public record CoordinateDto
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }

    }
}