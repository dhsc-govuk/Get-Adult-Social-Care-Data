using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("care_provider_locations")]
public class CareProviderLocation : EntityBase
{
    [Column("name"), StringLength(100)]
    public required string Name { get; init; }

    [Column("care_provider_fk")]
    public required int CareProviderFk { get; init; }

    [ForeignKey("CareProviderFk")]
    public virtual CareProvider CareProvider { get; init; } = null!;

    [Column("address"), StringLength(255)]
    public required string Address { get; init; }

    [Column("nominated_individual"), StringLength(255)]
    public required string NominatedIndividual { get; init; }

    [Column("local_authority_fk")]
    public required int LocalAuthorityFk { get; init; }

    [ForeignKey("LocalAuthorityFk")]
    public virtual LocalAuthority LocalAuthority { get; init; } = null!;

    [Column("geo_data_fk")]
    public required int GeoDataFk { get; init; }

    [ForeignKey("GeoDataFk")]
    public virtual GeoData GeoData { get; init; } = null!;
}