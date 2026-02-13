using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("postcodes")]
public partial class Postcode : SearchableEntity
{
    [Column("display_postcode"), StringLength(8)]
    public required string DisplayPostcode { get; init; } = null!;

    [Column("local_authority_fk")]
    public required int LocalAuthorityFk { get; init; }

    [ForeignKey("LocalAuthorityFk")]
    public virtual LocalAuthority LocalAuthority { get; init; } = null!;

    [Column("geo_data_fk")]
    public int? GeoDataFk { get; init; }

    [ForeignKey("GeoDataFk")]
    public virtual GeoData? GeoData { get; init; }
}