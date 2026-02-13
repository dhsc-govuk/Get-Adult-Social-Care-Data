using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("local_authorities")]
public class LocalAuthority : SearchableEntity
{
    [Column("name"), StringLength(50)]
    public required string Name { get; init; }

    [Column("region_fk")]
    public required int RegionFk { get; init; }

    [ForeignKey("RegionFk")]
    public virtual Region Region { get; init; } = null!;

    [Column("geo_data_fk")]
    public int? GeoDataFk { get; init; }

    [ForeignKey("GeoDataFk")]
    public virtual GeoData? GeoData { get; init; }
}