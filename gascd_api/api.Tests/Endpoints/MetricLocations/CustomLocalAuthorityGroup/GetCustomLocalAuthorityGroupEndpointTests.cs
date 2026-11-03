using api.Data.Shared;
using api.Endpoints.MetricLocation.CustomLocalAuthorityGroup;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

namespace api.Tests.Endpoints.MetricLocations.CustomLocalAuthorityGroup;

[Collection("Sequential")]
public class GetCustomLocalAuthorityGroupEndpointTests(App app) : TestBase<App>
{
    // The API omits null-valued keys (WhenWritingNull), so 'required' response
    // properties must not be treated as required when deserializing in tests.
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        TypeInfoResolver = new DefaultJsonTypeInfoResolver
        {
            Modifiers =
            {
                typeInfo =>
                {
                    foreach (var property in typeInfo.Properties)
                    {
                        property.IsRequired = false;
                    }
                }
            }
        },
    };

    private static string BuildUrl(IEnumerable<string> laCodes, MetricCodeEnum metricCode, string? requestingLaCode = null)
    {
        var query = string.Join("&", laCodes.Select(code => $"la_codes={code}"));
        var url = $"/api/metric_locations/custom_local_authority_group?{query}&metric_code={metricCode}";
        if (requestingLaCode is not null)
        {
            url += $"&requesting_la_code={requestingLaCode}";
        }
        return url;
    }

    private async Task<GetCustomLocalAuthorityGroupResponse?> GetResponse(string url)
    {
        var response = await app.Client.GetAsync(url, TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<GetCustomLocalAuthorityGroupResponse>(
            JsonOptions, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task GetCustomGroup_WithValidCodes_ReturnsMembersSortedByValueDescending()
    {
        var response = await GetResponse(BuildUrl(
            ["E08000014", "E08000015", "E08000016", "E08000017", "E08000018"],
            MetricCodeEnum.perc_households_deprivation_deprived));

        response.ShouldNotBeNull();
        response.GroupMembers.Count.ShouldBe(5);

        response.GroupMembers[0].Code.ShouldBe("E08000018");
        response.GroupMembers[0].DisplayName.ShouldBe("Sheffield");
        response.GroupMembers[0].MetricValue.ShouldBe(55.5m);

        response.GroupMembers[1].Code.ShouldBe("E08000017");
        response.GroupMembers[1].MetricValue.ShouldBe(54.5m);

        response.GroupMembers[2].Code.ShouldBe("E08000016");
        response.GroupMembers[2].MetricValue.ShouldBe(53.5m);

        response.GroupMembers[3].Code.ShouldBe("E08000014");
        response.GroupMembers[3].MetricValue.ShouldBe(52.5m);

        response.GroupMembers[4].Code.ShouldBe("E08000015");
        response.GroupMembers[4].MetricValue.ShouldBe(51.5m);

        // (55.5 + 54.5 + 53.5 + 52.5 + 51.5) / 5
        response.CustomGroupAverage.ShouldBe(53.5m);
        response.NationalAverage.ShouldBe(10.5m);
    }

    [Fact]
    public async Task GetCustomGroup_RequestingLaInGroup_IsExcludedFromAverageButKeptAsMember()
    {
        var response = await GetResponse(BuildUrl(
            ["E08000014", "E08000015", "E08000016", "E08000017", "E08000018"],
            MetricCodeEnum.perc_households_deprivation_deprived,
            requestingLaCode: "E08000015"));

        response.ShouldNotBeNull();
        response.GroupMembers.Count.ShouldBe(5);
        response.GroupMembers.ShouldContain(x => x.Code == "E08000015" && x.MetricValue == 51.5m);

        // (55.5 + 54.5 + 53.5 + 52.5) / 4 - the requesting LA's 51.5 is excluded
        response.CustomGroupAverage.ShouldBe(54.0m);
        response.NationalAverage.ShouldBe(10.5m);
    }

    [Fact]
    public async Task GetCustomGroup_RequestingLaNotInGroup_AverageCoversAllMembers()
    {
        var response = await GetResponse(BuildUrl(
            ["E08000014", "E08000018"],
            MetricCodeEnum.perc_households_deprivation_deprived,
            requestingLaCode: "E08000016"));

        response.ShouldNotBeNull();
        response.GroupMembers.Count.ShouldBe(2);

        // (52.5 + 55.5) / 2
        response.CustomGroupAverage.ShouldBe(54.0m);
    }

    [Fact]
    public async Task GetCustomGroup_DuplicateCodes_AreDeduplicated()
    {
        var response = await GetResponse(BuildUrl(
            ["E08000014", "E08000014", "E08000018"],
            MetricCodeEnum.perc_households_deprivation_deprived));

        response.ShouldNotBeNull();
        response.GroupMembers.Count.ShouldBe(2);
        response.CustomGroupAverage.ShouldBe(54.0m);
    }

    [Fact]
    public async Task GetCustomGroup_LaWithoutMetricData_HasNullValueSortedLastAndExcludedFromAverage()
    {
        var response = await GetResponse(BuildUrl(
            ["E08000014", "E08000019"],
            MetricCodeEnum.perc_households_deprivation_deprived));

        response.ShouldNotBeNull();
        response.GroupMembers.Count.ShouldBe(2);

        response.GroupMembers[0].Code.ShouldBe("E08000014");
        response.GroupMembers[0].MetricValue.ShouldBe(52.5m);

        response.GroupMembers[1].Code.ShouldBe("E08000019");
        response.GroupMembers[1].DisplayName.ShouldBe("York");
        response.GroupMembers[1].MetricValue.ShouldBeNull();

        response.CustomGroupAverage.ShouldBe(52.5m);
    }

    [Fact]
    public async Task GetCustomGroup_NoMemberHasMetricData_AverageIsNull()
    {
        var response = await GetResponse(BuildUrl(
            ["E08000019"],
            MetricCodeEnum.perc_households_deprivation_deprived));

        response.ShouldNotBeNull();
        response.GroupMembers.Count.ShouldBe(1);
        response.GroupMembers[0].MetricValue.ShouldBeNull();
        response.CustomGroupAverage.ShouldBeNull();
        response.NationalAverage.ShouldBe(10.5m);
    }

    [Fact]
    public async Task GetCustomGroup_UnknownCode_ReturnsBadRequest()
    {
        var response = await app.Client.GetAsync(
            BuildUrl(["E08000014", "E00000000"], MetricCodeEnum.perc_households_deprivation_deprived),
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        body.ShouldContain("E00000000");
    }

    [Fact]
    public async Task GetCustomGroup_MissingLaCodes_ReturnsBadRequest()
    {
        var response = await app.Client.GetAsync(
            $"/api/metric_locations/custom_local_authority_group?metric_code={MetricCodeEnum.perc_households_deprivation_deprived}",
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetCustomGroup_InvalidMetricCode_ReturnsBadRequest()
    {
        var response = await app.Client.GetAsync(
            "/api/metric_locations/custom_local_authority_group?la_codes=E08000014&metric_code=not_a_metric",
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}
