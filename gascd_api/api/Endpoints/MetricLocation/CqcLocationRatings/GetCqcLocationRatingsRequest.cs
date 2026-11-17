using FastEndpoints;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

/// <summary>Each list narrows the locations to those matching any of its values; a missing or empty list is no filter.</summary>
public class GetCqcLocationRatingsRequest
{
    [QueryParam, BindFrom("la_codes")]
    public List<string>? LaCodes { get; init; }

    [QueryParam, BindFrom("provider_codes")]
    public List<string>? ProviderCodes { get; init; }

    [QueryParam, BindFrom("service_types")]
    public List<string>? ServiceTypes { get; init; }

    [QueryParam, BindFrom("ratings")]
    public List<string>? Ratings { get; init; }

    /// <summary>Part of a location name, matched without regard to case.</summary>
    [QueryParam, BindFrom("search")]
    public string? Search { get; init; }

    /// <summary>The page to return, from 1. Every matching location is returned when no page size is given.</summary>
    [QueryParam, BindFrom("page")]
    public int? Page { get; init; }

    [QueryParam, BindFrom("page_size")]
    public int? PageSize { get; init; }
}