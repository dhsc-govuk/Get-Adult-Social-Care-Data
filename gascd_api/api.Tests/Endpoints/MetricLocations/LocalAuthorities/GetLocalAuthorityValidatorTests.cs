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
    [InlineData("E11")]
    [InlineData("E1123456789")]
    [InlineData("E41234567891011")]
    public void ValidLACode_ShouldBeValid(string laCode)
    {
        var request = new GetLocalAuthorityRequest { LocalAuthorityCode = laCode };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("E1", "Local Authority code has a minimum length of 3")]
    [InlineData(" ", "Local Authority code is required")]
    [InlineData("E112345678910111", "Local Authority code has a maximum length of 15")]
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