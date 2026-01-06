using api.Endpoints.MetricLocation.CpLocations;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.MetricLocations.CPLocations;

public class GetCareProviderLocationValidatorTests : IDisposable
{
    private GetCareProviderLocationValidator _validator;

    public GetCareProviderLocationValidatorTests()
    {
        _validator = new GetCareProviderLocationValidator();
    }

    [Theory]
    [InlineData("1-1")]
    [InlineData("1-123456789")]
    [InlineData("1-1234567891011")]
    public void ValidLocationCode_ShouldBeValid(string cplCode)
    {
        var request = new GetCareProviderLocationRequest { CareProviderLocationCode = cplCode };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("1-", "Care provider location code has a minimum length of 3")]
    [InlineData(" ", "Care provider location code is required")]
    [InlineData("1-12345678910111", "Care provider location code has a maximum length of 15")]
    public void InvalidPostcode_ShouldBeInvalid(string cplCode, string expectedErrorMessage)
    {
        var request = new GetCareProviderLocationRequest { CareProviderLocationCode = cplCode };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.CareProviderLocationCode)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}