using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("countries")]
public class Country : EntityBase
{
    [Column("name"), StringLength(50)]
    public required string Name { get; init; }
}