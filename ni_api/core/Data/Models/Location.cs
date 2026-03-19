using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace core.Data.Models;

[Table("locations")]
public class Location : EntityBase
{
    [Column("code"), StringLength(15)]
    public required string Code { get; init; }
    
    [Column("name"),  StringLength(255)]
    public required string Name { get; init; }
    
    [Column("type"), StringLength(255)]
    public required string Type { get; init; }
}