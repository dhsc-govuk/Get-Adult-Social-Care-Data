using api.Data;
using api.Data.Mappers;
using api.Logging;
using FastEndpoints;

namespace api.Endpoints.Geo.Postcode;

public class GetPostcodeEndpoint(GascdDataContext context, PostcodeMapper mapper, AppLogging<GetPostcodeEndpoint> logger) : Endpoint<GetPostcodeRequest, GetPostcodeResponse>
{
    public override void Configure()
    {
        Get("/api/geo/postcode");
    }

    public override async Task HandleAsync(GetPostcodeRequest req, CancellationToken ct)
    {
        logger.Info("Received request to get postcode");
        var datum = context.PostcodeData.SingleOrDefault(p => p.SanitisedPostcode == req.Postcode);
        if (datum == null)
        {
            logger.Info("Postcode not found");
            await Send.NotFoundAsync(ct);
            return;
        }

        logger.Info("Postcode found");
        GetPostcodeResponse response = mapper.PostCodeDatumToGetPostcodeResponse(datum);
        logger.Info("sending response to postcode");
        await Send.OkAsync(response, ct);
    }
}