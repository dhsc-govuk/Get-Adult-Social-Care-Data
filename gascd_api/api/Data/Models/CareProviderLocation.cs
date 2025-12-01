using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("care_provider_locations")]
public class CareProviderLocation
{
    [Key]
    [Column("id")]
    public string? Id { get; init; }

    [Column("name")]
    public string? Name { get; init; }

    [Column("care_provider_fk")]
    public string? CareProviderFk { get; init; }

    [ForeignKey("CareProviderFk")]
    public virtual CareProvider? CareProvider { get; init; }

    [Column("sanitised_postcode_fk")]
    public string? SanitisedPostcodeFk { get; init; }

    [ForeignKey("SanitisedPostcodeFk")]
    public virtual Postcode? Postcode { get; init; }

    [Column("address")]
    public string? Address { get; init; }

    [Column("nominated_individual")]
    public string? NominatedIndividual { get; init; }

    [Column("local_authority_id")]
    public string? LocalAuthorityId { get; init; }

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }

}