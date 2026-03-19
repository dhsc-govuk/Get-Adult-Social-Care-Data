using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace core.Data.Models;

[Table("users")]
public class User : EntityBase
{
    [Column("name"), StringLength(255)]
    public required string Name { get; init; }
    
    [Column("email"), StringLength(255)]
    public required string Email { get; init; }
}