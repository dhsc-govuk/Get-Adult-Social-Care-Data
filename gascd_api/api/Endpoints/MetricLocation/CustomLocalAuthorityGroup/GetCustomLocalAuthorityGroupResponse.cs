namespace api.Endpoints.MetricLocation.CustomLocalAuthorityGroup;

public class GetCustomLocalAuthorityGroupResponse
{
    public record GroupMember
    {
        public required string Code { get; init; }
        public required string DisplayName { get; init; }
        public decimal? MetricValue { get; init; }
    }

    public required List<GroupMember> GroupMembers { get; init; }

    public required decimal? CustomGroupAverage { get; init; }

    public required decimal? NationalAverage { get; init; }
}
