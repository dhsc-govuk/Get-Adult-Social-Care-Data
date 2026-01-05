using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.Countries;

public class GetCountryEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetCountryEndpoint> logger) : Endpoint<GetCountryRequest, GetCountryResponse>
{

    public override void Configure()
    {
        Get("/api/metric_locations/countries/{CountryCode}");
    }

    public override async Task HandleAsync(GetCountryRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for Region code: {code}", req.CountryCode);
        var country = context.Countries
            .Include(r => r.GeoData)
            .SingleOrDefault(x => x.Code == req.CountryCode);

        if (country == null)
        {
            logger.LogInformation("Country code not found: {code}", req.CountryCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.CountryToGetCountryResponse(country);
        logger.LogInformation("Finished processing region code: {code}", req.CountryCode);
        await Send.OkAsync(response, ct);
    }
}