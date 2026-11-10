using api.Endpoints.MetricLocation.CqcLocationRatings;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.CqcLocationRatings;

[Collection("Sequential")]
public class GetCqcLocationRatingsEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetCqcLocationRatings_WithValidLACode_ReturnsLocationsOrderedByName()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetCqcLocationRatingsEndpoint, GetCqcLocationRatingsRequest, GetCqcLocationRatingsResponse>(
                new GetCqcLocationRatingsRequest { LocalAuthorityCode = "E08000014" });

        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.DataMonth.ShouldBe(new DateOnly(2026, 11, 1));
        response.Locations.Select(x => x.Code).ShouldBe(["1-100000002", "1-100000003", "1-100000001"]);

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
    [InlineData("adult_social_care", new[] { "1-100000002", "1-100000003", "1-100000001" })]
    [InlineData("domiciliary_care", new[] { "1-100000002", "1-100000003" })]
    [InlineData("care_home", new[] { "1-100000001" })]
    [InlineData("extra_care_housing", new string[0])]
    public async Task GetCqcLocationRatings_WithServiceType_ReturnsOnlyLocationsOfferingIt(string serviceType, string[] expectedCodes)
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetCqcLocationRatingsEndpoint, GetCqcLocationRatingsRequest, GetCqcLocationRatingsResponse>(
                new GetCqcLocationRatingsRequest { LocalAuthorityCode = "E08000014", ServiceType = serviceType });

        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Locations.Select(x => x.Code).ShouldBe(expectedCodes);
    }

    [Fact]
    public async Task GetCqcLocationRatings_ForLAWithNoLocations_ReturnsEmptyList()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetCqcLocationRatingsEndpoint, GetCqcLocationRatingsRequest, GetCqcLocationRatingsResponse>(
                new GetCqcLocationRatingsRequest { LocalAuthorityCode = "E08000019" });

        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Locations.ShouldBeEmpty();
        response.DataMonth.ShouldBeNull();
    }

    [Fact]
    public async Task GetCqcLocationRatings_WithNonExistentLACode_ReturnsNotFound()
    {
        var response = await app.Client.GetAsync(
            "/api/metric_locations/cqc_location_ratings/E00000000",
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCqcLocationRatings_WithUnknownServiceType_ReturnsBadRequest()
    {
        var response = await app.Client.GetAsync(
            "/api/metric_locations/cqc_location_ratings/E08000014?service_type=hospital",
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}