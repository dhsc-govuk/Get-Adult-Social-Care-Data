using api.Endpoints.Geo.CareProviderLocationNeighbours;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursValidatorTests
{
    private GetCareProviderLocationNeighboursValidator _validator = new();

    [Fact]
    public void ValidCareProviderLocationCode()
    {
        var request = new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-123456789" };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "Care provider location code is required")]
    [InlineData(" ", "Care provider location code is required")]
    [InlineData("1-", "Care provider location code has a minimum length of 3")]
    [InlineData("1-09398234098320948320984032984093284093284098", "Care provider location code has a maximum length of 15")]
    public void InvalidCareProviderLocationCode(string careProviderCode, string expectedErrorMessage)
    {
        var request = new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = careProviderCode };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.CareProviderLocationCode)
            .WithErrorMessage(expectedErrorMessage);
    }
}