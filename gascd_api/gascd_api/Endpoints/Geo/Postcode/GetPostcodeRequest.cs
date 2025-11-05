using FastEndpoints;

namespace gascd_api.Endpoints.Geo.Postcode;

public class GetPostcodeRequest
{
    [QueryParam]
    public required string Postcode { get; set; }
}