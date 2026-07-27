using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("local_authority_peers")]
public class LocalAuthorityPeer : EntityBase
{
    [Column("local_authority_fk")]
    public required int LocalAuthorityFk { get; init; }

    [ForeignKey(nameof(LocalAuthorityFk))]
    public virtual LocalAuthority LocalAuthority { get; init; } = null!;

    [Column("peer_rank")]
    public required int PeerRank { get; init; }

    [Column("peer_local_authority_fk")]
    public required int PeerLocalAuthorityFk { get; init; }

    [ForeignKey(nameof(PeerLocalAuthorityFk))]
    public virtual LocalAuthority PeerLocalAuthority { get; init; } = null!;

}
