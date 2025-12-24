using api.Endpoints.MetricLocation.LocalAuthorities;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.MetricLocations.LocalAuthorities;


public class GetLocalAuthorityValidatorTests : IDisposable
{
    private GetLocalAuthorityValidator _validator;

    public GetLocalAuthorityValidatorTests()
    {
        _validator = new GetLocalAuthorityValidator();
    }

    [Theory]
    [InlineData("1-1")]
    [InlineData("1-123456789")]
    [InlineData("1-1234567891011")]
    public void ValidLACode_ShouldBeValid(string laCode)
    {
        var request = new GetLocalAuthorityRequest { LocalAuthorityCode = laCode };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("1-", "Local Authority code has a minimum length of 3")]
    [InlineData(" ", "Local Authority code is required")]
    [InlineData("1-12345678910111", "Local Authority code has a maximum length of 15")]
    public void InvalidLACode_ShouldBeInvalid(string cplCode, string expectedErrorMessage)
    {
        var request = new GetLocalAuthorityRequest { LocalAuthorityCode = cplCode };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.LocalAuthorityCode)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}