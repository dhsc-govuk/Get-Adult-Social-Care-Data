using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("postcodes")]
public partial class PostcodeDatum
{
    [Key]
    [Column("sanitised_postcode")]
    public string SanitisedPostcode { get; init; } = null!;

    [Column("display_postcode")]
    public string DisplayPostcode { get; init; } = null!;

    [Column("latitude")]
    public decimal? Latitude { get; init; }

    [Column("longitude")]
    public decimal? Longitude { get; init; }

    [Column("la_code")]
    public string? LaCode { get; init; }
}