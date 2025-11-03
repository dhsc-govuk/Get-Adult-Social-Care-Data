using FastEndpoints;
using gascd_api.Data;

namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeEndpoint(GascdDataContext context) : Endpoint<GetPostcodeRequest, GetPostcodeResponse>
{
    public override void Configure()
    {
        Get("/api/geo/postcode");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPostcodeRequest req, CancellationToken ct)
    {
        var datum = context.PostcodeData.SingleOrDefault(p => p.SanitisedPostcode == req.Postcode);
        if (datum == null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }
        var response = new GetPostcodeResponse
        {
            SanitisedPostcode = datum.SanitisedPostcode, 
            DisplayPostcode = datum.DisplayPostcode, 
            Latitude = datum.Latitude, 
            Longitude = datum.Longitude, 
            LaCode = datum.LaCode
        };
        await Send.OkAsync(response, ct);
    }
}