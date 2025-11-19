using api.Data;
using api.Data.Mappers;
using api.Logging;
using FastEndpoints;

namespace api.Endpoints.Geo.Postcode;

public class GetPostcodeEndpoint(GascdDataContext context, PostcodeMapper mapper, ILogger<GetPostcodeEndpoint> logger)
    : Endpoint<GetPostcodeRequest, GetPostcodeResponse>
{
    public override void Configure()
    {
        Get("/api/geo/postcode");
    }

    public override async Task HandleAsync(GetPostcodeRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for postcode: {postcode}", req.Postcode);
        var datum = context.PostcodeData.SingleOrDefault(p => p.SanitisedPostcode == req.Postcode);
        if (datum == null)
        {
            logger.LogInformation("Postcode not found: {postcode}", req.Postcode);
            await Send.NotFoundAsync(ct);
            return;
        }

        GetPostcodeResponse response = mapper.PostCodeDatumToGetPostcodeResponse(datum);
        logger.LogInformation("Finished processing postcode: {postcode}", req.Postcode);
        await Send.OkAsync(response, ct);
    }
}