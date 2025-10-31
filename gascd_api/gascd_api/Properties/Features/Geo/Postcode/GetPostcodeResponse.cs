namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeResponse
{
    public required string SanitisedPostcode { get; init; }
    public required string DisplayPostcode { get; init; }
    public decimal? Latitude {get; private set;}
    public decimal? Longitude  {get; private set;}
    public string? LaCode { get; private set;}
    public string? LaName  { get; private set;}
}