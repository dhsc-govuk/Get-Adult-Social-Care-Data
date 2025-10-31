using System;
using System.Collections.Generic;

namespace gascd_api;

public partial class PostcodeDatum
{
    public string SanitisedPostcode { get; init; } = null!;

    public string? DisplayPostcode { get; init; }

    public decimal? Latitude { get; init; }

    public decimal? Longitude { get; init; }

    public string? LaCode { get; init; }
}
