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
    [InlineData("")]
    [InlineData(" ")]
    public void InvalidCareProviderId(string careProviderId)
    {
        var request = new GetCareProviderRequest { CareProviderId = careProviderId };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.CareProviderId);
    }

    public void Dispose()
    {

    }
}