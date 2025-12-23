using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("care_providers")]
public class CareProvider : SearchableEntity
{
    [Column("name"), StringLength(100)]
    public required string Name { get; init; }

    public virtual ICollection<CareProviderLocation>? CareProviderLocations { get; init; }
}