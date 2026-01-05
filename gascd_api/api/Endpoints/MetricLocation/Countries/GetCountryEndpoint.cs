using FastEndpoints;

namespace api.Endpoints.MetricLocation.Countries;

public class GetCountryEndpoint : Endpoint<GetCountryRequest, GetCountryResponse>
{

    public override void Configure()
    {
        Get("/api/metric_locations/countries/{CountryCode}");
    }

    public override Task HandleAsync(GetCountryRequest req, CancellationToken ct)
    {
        return Task.CompletedTask;
    }
}