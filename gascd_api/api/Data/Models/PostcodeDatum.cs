namespace api.Data.Models;

public partial class PostcodeDatum
{
    public string SanitisedPostcode { get; init; } = null!;

    public string DisplayPostcode { get; init; } = null!;

    public decimal? Latitude { get; init; }

    public decimal? Longitude { get; init; }

    public string? LaCode { get; init; }
}