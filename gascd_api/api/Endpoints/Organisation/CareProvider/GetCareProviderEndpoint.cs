using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetCareProviderEndpoint> logger) : Endpoint<GetCareProviderRequest, GetCareProviderResponse>
{
    public override void Configure()
    {
        Get("/api/organisation/care_provider/{CareProviderCode}");
    }

    public override async Task HandleAsync(GetCareProviderRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for care provider code: {code}", req.CareProviderCode);
        var careProvider = context.CareProviders
            .Include(cp => cp.CareProviderLocations)
            .SingleOrDefault(cp => cp.Code == req.CareProviderCode);

        if (careProvider == null)
        {
            logger.LogInformation("Care provider code not found: {code}", req.CareProviderCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        GetCareProviderResponse response = mapper.CareProviderToGetCareProviderResponse(careProvider);

        logger.LogInformation("Finished processing care provider code: {code}", req.CareProviderCode);
        await Send.OkAsync(response, ct);
    }
}