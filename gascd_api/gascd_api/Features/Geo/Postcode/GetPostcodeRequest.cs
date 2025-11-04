using FastEndpoints;

namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeRequest
{
    [QueryParam]
    public required string Postcode { get; set; }
}