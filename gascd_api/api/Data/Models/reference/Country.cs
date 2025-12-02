using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("countries")]
public class Country : EntityBase
{
    [Column("name"), StringLength(50)]
    public string? Name { get; init; }
}