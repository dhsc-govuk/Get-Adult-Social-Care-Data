using FastEndpoints;

namespace api.Endpoints.MetricLocation.Countries;

public class GetCountryRequest
{
    [RouteParam]
    public required string CountryCode { get; set; }
}