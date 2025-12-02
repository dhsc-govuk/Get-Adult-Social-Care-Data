using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("postcodes")]
public partial class Postcode : EntityBase
{
    [Column("display_postcode"), StringLength(8)]
    public required string DisplayPostcode { get; init; } = null!;

    [Column("latitude")]
    public required decimal Latitude { get; init; }

    [Column("longitude")]
    public required decimal Longitude { get; init; }

    [Column("local_authority_fk")]
    public required string LocalAuthorityFk { get; init; }

    [ForeignKey("LocalAuthorityFk")]
    public virtual LocalAuthority LocalAuthority { get; init; } = null!;
}