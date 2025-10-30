using FastEndpoints;

namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeRequest
{
    [QueryParam]
    public string? Postcode { get; set; }
}