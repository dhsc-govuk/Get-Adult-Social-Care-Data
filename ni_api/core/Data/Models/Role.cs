using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace core.Data.Models;

[Table("roles")]
public class Role : EntityBase
{
    [Column("role_type"), StringLength(255)]
    public required string RoleType { get; init; }
    
    [Column("location_fk")]
    public int LocationFk { get; init; }

    [ForeignKey(nameof(LocationFk))] 
    public virtual Location Location { get; init; } = null!;
    
    [Column("user_fk")]
    public int UserFk { get; init; }

    [ForeignKey(nameof(UserFk))]
    public virtual User User { get; init; } = null!;
}