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

    /// <summary>
    /// The custom group's value: the average of the members' values, except for CQC metrics, where location
    /// counts are the total and percentages are pooled from those totals.
    /// </summary>
    public required decimal? CustomGroupAverage { get; init; }

    public required decimal? NationalAverage { get; init; }
}
