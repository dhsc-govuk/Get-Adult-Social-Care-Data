using FastEndpoints;

namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeEndpoint(GascdDataContext context) : Endpoint<GetPostcodeRequest, GetPostcodeResponse>
{
    private GascdDataContext _context = context;
    
    public override void Configure()
    {
        Get("/api/geo/postcode");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPostcodeRequest req, CancellationToken ct)
    {
        var thing = _context.PostcodeData.First(p => p.SanitisedPostcode == req.Postcode);
        var response = new GetPostcodeResponse
        {
            SanitisedPostcode = thing.SanitisedPostcode, DisplayPostcode = thing.DisplayPostcode, Latitude = thing.Latitude, Longitude = thing.Longitude, LaCode = thing.LaCode
        };
        await Send.OkAsync(response, ct);
    }
}