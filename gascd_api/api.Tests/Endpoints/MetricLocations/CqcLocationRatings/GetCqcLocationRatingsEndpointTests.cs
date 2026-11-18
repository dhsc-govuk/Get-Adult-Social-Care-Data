using api.Endpoints.MetricLocation.CqcLocationRatings;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.CqcLocationRatings;

[Collection("Sequential")]
public class GetCqcLocationRatingsEndpointTests(App app) : TestBase<App>
{
    private async Task<GetCqcLocationRatingsResponse> Get(GetCqcLocationRatingsRequest request)
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetCqcLocationRatingsEndpoint, GetCqcLocationRatingsRequest, GetCqcLocationRatingsResponse>(request);

        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        return response;
    }

    [Fact]
    public async Task GetCqcLocationRatings_WithNoFilters_ReturnsEveryLocationMostRecentlyRatedFirst()
    {
        var response = await Get(new GetCqcLocationRatingsRequest());

        response.DataMonth.ShouldBe(new DateOnly(2026, 11, 1));
        response.Total.ShouldBe(4);
        // The location not yet inspected has no rating date, so it comes last
        response.Locations.Select(x => x.Code).ShouldBe(["1-100000004", "1-100000001", "1-100000003", "1-100000002"]);

        var rated = response.Locations.Single(x => x.Code == "1-100000001");
        rated.Name.ShouldBe("Riverside Care Home");
        rated.ProviderCode.ShouldBe("1-200000001");
        rated.ProviderName.ShouldBe("Riverside Care Ltd");
        rated.ServiceTypes.ShouldBe(["adult_social_care", "care_home", "care_home_nursing"]);
        rated.OverallRating.ShouldBe("good");
        rated.RatingPublished.ShouldBe(new DateOnly(2025, 6, 12));

        var uninspected = response.Locations.Single(x => x.Code == "1-100000002");
        uninspected.OverallRating.ShouldBeNull();
        uninspected.RatingPublished.ShouldBeNull();
    }

    [Theory]
    [InlineData(new[] { "E08000014" }, new[] { "1-100000001", "1-100000003", "1-100000002" })]
    [InlineData(new[] { "E08000014", "E08000015" }, new[] { "1-100000004", "1-100000001", "1-100000003", "1-100000002" })]
    [InlineData(new[] { "E08000019" }, new string[0])]
    [InlineData(new[] { "E00000000" }, new string[0])]
    public async Task GetCqcLocationRatings_WithLaCodes_ReturnsOnlyLocationsInThem(string[] laCodes, string[] expectedCodes)
    {
        var response = await Get(new GetCqcLocationRatingsRequest { LaCodes = [.. laCodes] });

        response.Locations.Select(x => x.Code).ShouldBe(expectedCodes);
        response.Total.ShouldBe(expectedCodes.Length);
        response.DataMonth.ShouldBe(new DateOnly(2026, 11, 1));
    }

    [Fact]
    public async Task GetCqcLocationRatings_WithProviderCodes_ReturnsOnlyTheirLocations()
    {
        var response = await Get(new GetCqcLocationRatingsRequest { ProviderCodes = ["1-200000002"] });

        response.Locations.Select(x => x.Code).ShouldBe(["1-100000003", "1-100000002"]);
    }

    [Theory]
    [InlineData(new[] { "adult_social_care" }, new[] { "1-100000004", "1-100000001", "1-100000003", "1-100000002" })]
    [InlineData(new[] { "domiciliary_care" }, new[] { "1-100000003", "1-100000002" })]
    [InlineData(new[] { "care_home_nursing", "supported_living" }, new[] { "1-100000001", "1-100000003" })]
    [InlineData(new[] { "extra_care_housing" }, new string[0])]
    public async Task GetCqcLocationRatings_WithServiceTypes_ReturnsLocationsOfferingAnyOfThem(string[] serviceTypes, string[] expectedCodes)
    {
        var response = await Get(new GetCqcLocationRatingsRequest { ServiceTypes = [.. serviceTypes] });

        response.Locations.Select(x => x.Code).ShouldBe(expectedCodes);
    }

    [Fact]
    public async Task GetCqcLocationRatings_WithRatings_ReturnsOnlyLocationsWithThem()
    {
        var response = await Get(new GetCqcLocationRatingsRequest { Ratings = ["good", "outstanding"] });

        response.Locations.Select(x => x.Code).ShouldBe(["1-100000001", "1-100000003"]);
    }

    [Theory]
    [InlineData("care", new[] { "1-100000001" })]
    [InlineData(" MERSEY ", new[] { "1-100000003" })]
    [InlineData("%", new string[0])]
    public async Task GetCqcLocationRatings_WithSearch_MatchesPartOfTheLocationName(string search, string[] expectedCodes)
    {
        var response = await Get(new GetCqcLocationRatingsRequest { Search = search });

        response.Locations.Select(x => x.Code).ShouldBe(expectedCodes);
    }

    [Fact]
    public async Task GetCqcLocationRatings_WithSeveralFilters_ReturnsLocationsMatchingAllOfThem()
    {
        var response = await Get(new GetCqcLocationRatingsRequest
        {
            LaCodes = ["E08000014"],
            ProviderCodes = ["1-200000002"],
            ServiceTypes = ["domiciliary_care"],
            Ratings = ["outstanding"],
        });

        response.Locations.Select(x => x.Code).ShouldBe(["1-100000003"]);
    }

    [Fact]
    public async Task GetCqcLocationRatings_WithPageSize_ReturnsThatPageAndTheTotal()
    {
        var response = await Get(new GetCqcLocationRatingsRequest { Page = 2, PageSize = 3 });

        response.Total.ShouldBe(4);
        response.Locations.Select(x => x.Code).ShouldBe(["1-100000002"]);
    }

    [Theory]
    [InlineData("service_types=hospital")]
    [InlineData("ratings=excellent")]
    [InlineData("page=0")]
    [InlineData("page_size=101")]
    public async Task GetCqcLocationRatings_WithInvalidQuery_ReturnsBadRequest(string query)
    {
        var response = await app.Client.GetAsync(
            $"/api/metric_locations/cqc_location_ratings?{query}",
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}