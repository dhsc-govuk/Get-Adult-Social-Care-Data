namespace gascd_api.Features.Geo.Postcode;

public class GetPostcodeResponse
{
    public required string SanitisedPostcode { get; init; }
    public required string DisplayPostcode { get; init; }
    public decimal? Latitude { get; init; }
    public decimal? Longitude { get; init; }
    public string? LaCode { get; init; }
    public string? LaName { get; init; }
}