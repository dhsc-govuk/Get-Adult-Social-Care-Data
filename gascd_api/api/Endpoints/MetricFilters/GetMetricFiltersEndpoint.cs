using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricFilters;

public class GetMetricFiltersEndpoint(GascdDataContext context, ReferenceMapper mapper) : Endpoint<GetMetricFiltersRequest, GetMetricFiltersResponse>
{
    public override void Configure()
    {
        Get("/api/metric_filters/{MetricGroupCode}");
    }

    public override async Task HandleAsync(GetMetricFiltersRequest req, CancellationToken ct)
    {
        var metricGroup = context.MetricGroups
            .Include(mg => mg.Metrics)
            .SingleOrDefault(cp => cp.Code == req.MetricGroupCode);

        var response = mapper.MetricGroupToMetricFiltersResponse(metricGroup);

        await Send.OkAsync(response, ct);

    }
}