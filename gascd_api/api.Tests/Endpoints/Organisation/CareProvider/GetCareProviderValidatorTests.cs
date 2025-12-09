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
        var request = new GetCareProviderRequest { CareProviderId = "1-123456789" };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "Care provider ID is required")]
    [InlineData(" ", "Care provider ID is required")]
    [InlineData("1-", "Care provider ID has a minimum length of 3")]
    public void InvalidCareProviderId(string careProviderId, string expectedErrorMessage)
    {
        var request = new GetCareProviderRequest { CareProviderId = careProviderId };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.CareProviderId)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}