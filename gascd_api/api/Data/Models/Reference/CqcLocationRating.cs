using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

/// <summary>
/// The latest overall CQC rating of an active adult social care location, one row per location.
/// Loaded by the data platform from the CQC HSCA Active Locations file, replaced in full each month.
/// </summary>
[Table("cqc_location_ratings")]
public class CqcLocationRating : EntityBase
{
    [Column("location_code"), StringLength(15)]
    public required string LocationCode { get; init; }

    [Column("location_name"), StringLength(255)]
    public required string LocationName { get; init; }

    [Column("provider_code"), StringLength(15)]
    public required string ProviderCode { get; init; }

    [Column("provider_name"), StringLength(255)]
    public required string ProviderName { get; init; }

    [Column("local_authority_fk")]
    public required int LocalAuthorityFk { get; init; }

    [ForeignKey(nameof(LocalAuthorityFk))]
    public virtual LocalAuthority LocalAuthority { get; init; } = null!;

    /// <summary>Service type keys, the same as the CQC ratings metric codes' suffixes.</summary>
    [Column("service_types")]
    public required List<string> ServiceTypes { get; init; }

    /// <summary>Rating key (outstanding, good, requires_improvement, inadequate, insufficient_evidence); null when not yet inspected.</summary>
    [Column("overall_rating"), StringLength(25)]
    public string? OverallRating { get; init; }

    /// <summary>Publication date of the latest overall rating; null when not yet inspected.</summary>
    [Column("rating_published")]
    public DateOnly? RatingPublished { get; init; }

    /// <summary>Month of the CQC file the row comes from.</summary>
    [Column("data_month")]
    public required DateOnly DataMonth { get; init; }
}