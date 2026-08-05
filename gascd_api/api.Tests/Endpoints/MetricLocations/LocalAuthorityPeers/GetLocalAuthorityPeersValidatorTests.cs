using api.Endpoints.MetricLocation.LocalAuthorityPeers;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.MetricLocations.LocalAuthorityPeers;

public class GetLocalAuthorityPeersValidatorTests
{
    private GetLocalAuthorityPeersValidator _validator = new();

    [Theory]
    [InlineData("E11")]
    [InlineData("E1123456789")]
    [InlineData("E41234567891011")]
    public void ValidLACode_ShouldBeValid(string laCode)
    {
        var request = new GetLocalAuthorityPeersRequest
        {
            LocalAuthorityCode = laCode,
            MetricCode = api.Data.Shared.MetricCodeEnum.perc_households_deprivation_deprived
        };

        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("E1", "Local Authority code has a minimum length of 3")]
    [InlineData(" ", "Local Authority code is required")]
    [InlineData("E112345678910111", "Local Authority code has a maximum length of 15")]
    public void InvalidLACode_ShouldBeInvalid(string laCode, string expectedErrorMessage)
    {
        var request = new GetLocalAuthorityPeersRequest
        {
            LocalAuthorityCode = laCode,
            MetricCode = api.Data.Shared.MetricCodeEnum.perc_households_deprivation_deprived
        };

        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.LocalAuthorityCode)
            .WithErrorMessage(expectedErrorMessage);
    }
}
