namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeResponse
{
    public required string SanitisedPostcode { get; init; }
    public required string DisplayPostcode { get; init; }
    public decimal? Latitude;
    public decimal? Longitude;
    public string? LaCode;
    public string? LaName;
}