using api.Endpoints.MetricLocation.CqcLocationRatings;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.MetricLocations.CqcLocationRatings;

public class GetCqcLocationRatingsValidatorTests
{
    private GetCqcLocationRatingsValidator _validator = new();

    [Theory]
    [InlineData(null)]
    [InlineData("adult_social_care")]
    [InlineData("care_home_nursing")]
    [InlineData("other_community_care")]
    public void ValidServiceType_ShouldBeValid(string? serviceType)
    {
        var request = new GetCqcLocationRatingsRequest { LocalAuthorityCode = "E08000014", ServiceType = serviceType };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("hospital")]
    [InlineData("Care_Home")]
    public void InvalidServiceType_ShouldBeInvalid(string serviceType)
    {
        var request = new GetCqcLocationRatingsRequest { LocalAuthorityCode = "E08000014", ServiceType = serviceType };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.ServiceType);
    }

    [Theory]
    [InlineData("E1", "Local Authority code has a minimum length of 3")]
    [InlineData(" ", "Local Authority code is required")]
    [InlineData("E112345678910111", "Local Authority code has a maximum length of 15")]
    public void InvalidLACode_ShouldBeInvalid(string laCode, string expectedErrorMessage)
    {
        var request = new GetCqcLocationRatingsRequest { LocalAuthorityCode = laCode };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.LocalAuthorityCode)
            .WithErrorMessage(expectedErrorMessage);
    }
}