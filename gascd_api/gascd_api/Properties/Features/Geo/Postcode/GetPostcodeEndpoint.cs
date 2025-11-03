using FastEndpoints;
using gascd_api.Data;
using gascd_api.Data.Mappers;

namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeEndpoint(GascdDataContext context, PostcodeMapper mapper) : Endpoint<GetPostcodeRequest, GetPostcodeResponse>
{
    public override void Configure()
    {
        Get("/api/geo/postcode");
    }

    public override async Task HandleAsync(GetPostcodeRequest req, CancellationToken ct)
    {
        var datum = context.PostcodeData.SingleOrDefault(p => p.SanitisedPostcode == req.Postcode);
        if (datum == null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        GetPostcodeResponse response = mapper.PostCodeDatumToGetPostcodeResponse(datum);
        await Send.OkAsync(response, ct);
    }
}