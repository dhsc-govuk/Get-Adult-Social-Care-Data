using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("regions")]
public class Region : EntityBase
{
    [Column("name"), StringLength(50)]
    public required string Name { get; init; }

    [Column("country_fk")]
    public required int CountryFk { get; init; }

    [ForeignKey("CountryFk")]
    public virtual Country Country { get; init; } = null!;

    [Column("geo_data_fk")]
    public required int GeoDataFk { get; init; }

    [ForeignKey("GeoDataFk")]
    public virtual GeoData GeoData { get; init; } = null!;
}