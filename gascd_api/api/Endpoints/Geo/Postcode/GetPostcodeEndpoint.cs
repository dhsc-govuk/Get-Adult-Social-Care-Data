using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

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
        var postcodeEntity = context.PostcodeData
            .Include(p => p.LocalAuthority)
            .SingleOrDefault(p => p.Code == req.Postcode);

        if (postcodeEntity == null)
        {
            logger.LogInformation("Postcode not found: {postcode}", req.Postcode);
            await Send.NotFoundAsync(ct);
            return;
        }

        GetPostcodeResponse response = mapper.PostcodeToGetPostcodeResponse(postcodeEntity);
        logger.LogInformation("Finished processing postcode: {postcode}", req.Postcode);
        await Send.OkAsync(response, ct);
    }
}