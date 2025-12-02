using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.reference;

[Table("care_providers")]
public class CareProvider : EntityBase
{
    [Column("name"), StringLength(100)]
    public string? Name { get; init; }
}