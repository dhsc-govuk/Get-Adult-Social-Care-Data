namespace api.Endpoints.MetricLocation.CpLocations;

public class GeoDataDto
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public List<CoordinateDto>? Polygon { get; init; }

    public record CoordinateDto
    {
        public double Latitude { get; init; }
        public double Longitude { get; init; }

    }


}