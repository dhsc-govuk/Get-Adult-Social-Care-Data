namespace api.Endpoints.Geo.Postcode;

public class GetPostcodeResponse
{
    public required string SanitisedPostcode { get; init; }
    public required string DisplayPostcode { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public string? LaCode { get; init; }
    public string? LaName { get; init; }
}