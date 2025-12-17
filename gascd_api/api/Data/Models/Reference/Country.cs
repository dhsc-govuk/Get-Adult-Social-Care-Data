using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("countries")]
public class Country : EntityBase
{
    [Column("name"), StringLength(60)]
    public required string Name { get; init; }

    [Column("geo_data_fk")]
    public required int GeoDataFk { get; init; }

    [ForeignKey("GeoDataFk")]
    public virtual GeoData GeoData { get; init; } = null!;
}