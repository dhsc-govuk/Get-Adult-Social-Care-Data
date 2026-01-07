using FastEndpoints;

namespace api.Endpoints.MetricFilters;

public class GetMetricFiltersEndpoint : Endpoint<GetMetricFiltersRequest, GetMetricFiltersResponse>
{
    public override void Configure()
    {
        Get("/api/metric_filters/{MetricGroupCode}");
    }

    public override async Task HandleAsync(GetMetricFiltersRequest req, CancellationToken ct)
    {

        await Send.OkAsync(ct);
    }
}