using api.Data.Shared;
using api.Endpoints.Metrics.Data;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.Metrics.Data;

public class GetMetricLocationsValidatorTests
{
    private readonly GetMetricLocationsValidator _validator = new();

    [Theory]
    [InlineData("E11")]
    [InlineData("E1123456789")]
    [InlineData("E41234567891011")]
    public void GetMetric_ValidLocationCode_ShouldBeValid(string locationCode)
    {
        var request = new GetMetricRequest.Location { LocationCode = locationCode, LocationType = LocationTypeEnum.National };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("co", "Location code has a minimum length of 3")]
    [InlineData(" ", "Location code is required")]
    [InlineData("12345678910111213", "Location code has a maximum length of 15")]
    public void GetMetric_InvalidLocationCode_ShouldBeInvalid(string locationCode, string expectedErrorMessage)
    {
        var request = new GetMetricRequest.Location { LocationCode = locationCode, LocationType = LocationTypeEnum.National };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(l => l.LocationCode).WithErrorMessage(expectedErrorMessage);
    }
}