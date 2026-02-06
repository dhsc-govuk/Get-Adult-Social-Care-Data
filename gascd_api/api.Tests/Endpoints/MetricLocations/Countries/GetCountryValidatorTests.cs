using api.Endpoints.MetricLocation.Countries;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.MetricLocations.Countries;

public class GetCountryValidatorTests : IDisposable
{
    private GetCountryValidator _validator = new();

    [Theory]
    [InlineData("E11")]
    [InlineData("E1123456789")]
    [InlineData("E41234567891011")]
    public void ValidCountryCode_ShouldBeValid(string laCode)
    {
        var request = new GetCountryRequest { CountryCode = laCode };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("E1", "Country code has a minimum length of 3")]
    [InlineData(" ", "Country code is required")]
    [InlineData("E1123233223243278910111", "Country code has a maximum length of 15")]
    public void InvalidCountryCode_ShouldBeInvalid(string countryCode, string expectedErrorMessage)
    {
        var request = new GetCountryRequest { CountryCode = countryCode };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.CountryCode)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}