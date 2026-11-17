using api.Endpoints.MetricLocation.CqcLocationRatings;
using FluentValidation.TestHelper;
using Shouldly;

namespace api.Tests.Endpoints.MetricLocations.CqcLocationRatings;

public class GetCqcLocationRatingsValidatorTests
{
    private GetCqcLocationRatingsValidator _validator = new();

    [Fact]
    public void NoFilters_ShouldBeValid()
    {
        var result = _validator.TestValidate(new GetCqcLocationRatingsRequest());
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ValidFilters_ShouldBeValid()
    {
        var request = new GetCqcLocationRatingsRequest
        {
            LaCodes = ["E08000014", "E08000015"],
            ProviderCodes = ["1-200000001"],
            ServiceTypes = ["adult_social_care", "care_home_nursing", "other_community_care"],
            Ratings = ["outstanding", "insufficient_evidence"],
            Search = "Riverside",
            Page = 1,
            PageSize = GetCqcLocationRatingsValidator.MaxPageSize,
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ServiceTypes_AreTheNineCqcMetricServiceTypes()
    {
        GetCqcLocationRatingsValidator.ServiceTypes.ShouldBe(
        [
            "adult_social_care", "care_home", "care_home_nursing", "care_home_residential", "community_care",
            "domiciliary_care", "supported_living", "extra_care_housing", "other_community_care",
        ], ignoreOrder: true);
    }

    [Fact]
    public void Ratings_AreTheFiveCqcMetricRatings()
    {
        GetCqcLocationRatingsValidator.Ratings.ShouldBe(
        [
            "outstanding", "good", "requires_improvement", "inadequate", "insufficient_evidence",
        ], ignoreOrder: true);
    }

    [Theory]
    [InlineData("")]
    [InlineData("hospital")]
    [InlineData("Care_Home")]
    public void InvalidServiceType_ShouldBeInvalid(string serviceType)
    {
        var request = new GetCqcLocationRatingsRequest { ServiceTypes = ["care_home", serviceType] };

        var result = _validator.TestValidate(request);
        result.IsValid.ShouldBeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("excellent")]
    [InlineData("Good")]
    public void InvalidRating_ShouldBeInvalid(string rating)
    {
        var request = new GetCqcLocationRatingsRequest { Ratings = [rating] };

        var result = _validator.TestValidate(request);
        result.IsValid.ShouldBeFalse();
    }

    [Theory]
    [InlineData("E1", "Local Authority code has a minimum length of 3")]
    [InlineData(" ", "Local Authority code is required")]
    [InlineData("E112345678910111", "Local Authority code has a maximum length of 15")]
    public void InvalidLACode_ShouldBeInvalid(string laCode, string expectedErrorMessage)
    {
        var request = new GetCqcLocationRatingsRequest { LaCodes = [laCode] };

        var result = _validator.TestValidate(request);
        result.Errors.Select(e => e.ErrorMessage).ShouldContain(expectedErrorMessage);
    }

    [Theory]
    [InlineData(0, 10)]
    [InlineData(1, 0)]
    [InlineData(1, GetCqcLocationRatingsValidator.MaxPageSize + 1)]
    public void InvalidPaging_ShouldBeInvalid(int page, int pageSize)
    {
        var request = new GetCqcLocationRatingsRequest { Page = page, PageSize = pageSize };

        var result = _validator.TestValidate(request);
        result.IsValid.ShouldBeFalse();
    }
}