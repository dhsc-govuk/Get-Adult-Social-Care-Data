using FastEndpoints;

namespace api.Endpoints.Geo.Postcode;

public class GetPostcodeRequest
{
    [QueryParam]
    public required string Postcode { get; set; }
}