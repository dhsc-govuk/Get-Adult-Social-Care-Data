using api.Endpoints.Organisation.CareProvider;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.Organisation.CareProvider;

public class GetCareProviderValidatorTests : IDisposable
{
    private GetCareProviderValidator _validator;

    public GetCareProviderValidatorTests()
    {
        _validator = new GetCareProviderValidator();
    }

    [Fact]
    public void ValidCareProviderId()
    {
        var request = new GetCareProviderRequest { CareProviderCode = "1-123456789" };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "Care provider code is required")]
    [InlineData(" ", "Care provider code is required")]
    [InlineData("1-", "Care provider code has a minimum length of 3")]
    [InlineData("1-09398234098320948320984032984093284093284098", "Care provider code has a maximum length of 15")]
    public void InvalidCareProviderId(string careProviderCode, string expectedErrorMessage)
    {
        var request = new GetCareProviderRequest { CareProviderCode = careProviderCode };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.CareProviderCode)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}