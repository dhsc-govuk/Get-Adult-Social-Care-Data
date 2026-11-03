using api.Data.Shared;
using api.Endpoints.MetricLocation.CustomLocalAuthorityGroup;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.MetricLocations.CustomLocalAuthorityGroup;

public class GetCustomLocalAuthorityGroupValidatorTests
{
    private readonly GetCustomLocalAuthorityGroupValidator _validator = new();

    private static GetCustomLocalAuthorityGroupRequest BuildRequest(
        List<string> laCodes,
        string? requestingLaCode = null)
    {
        return new GetCustomLocalAuthorityGroupRequest
        {
            LaCodes = laCodes,
            MetricCode = MetricCodeEnum.perc_households_deprivation_deprived,
            RequestingLaCode = requestingLaCode,
        };
    }

    [Fact]
    public void ValidRequest_ShouldBeValid()
    {
        var result = _validator.TestValidate(BuildRequest(["E08000014", "E08000015"], "E08000016"));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void SingleCode_NoRequestingLa_ShouldBeValid()
    {
        var result = _validator.TestValidate(BuildRequest(["E08000014"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void EmptyLaCodes_ShouldBeInvalid()
    {
        var result = _validator.TestValidate(BuildRequest([]));
        result.ShouldHaveValidationErrorFor(r => r.LaCodes)
            .WithErrorMessage("At least one Local Authority code is required");
    }

    [Fact]
    public void TooManyLaCodes_ShouldBeInvalid()
    {
        var codes = Enumerable.Range(0, GetCustomLocalAuthorityGroupEndpoint.MaxLaCodes + 1)
            .Select(i => $"E{i:D8}")
            .ToList();

        var result = _validator.TestValidate(BuildRequest(codes));
        result.ShouldHaveValidationErrorFor(r => r.LaCodes)
            .WithErrorMessage($"A maximum of {GetCustomLocalAuthorityGroupEndpoint.MaxLaCodes} Local Authority codes can be requested");
    }

    [Theory]
    [InlineData("E1", "Local Authority code has a minimum length of 3")]
    [InlineData(" ", "Local Authority code is required")]
    [InlineData("E112345678910111", "Local Authority code has a maximum length of 15")]
    public void InvalidLaCodeElement_ShouldBeInvalid(string laCode, string expectedErrorMessage)
    {
        var result = _validator.TestValidate(BuildRequest(["E08000014", laCode]));
        result.ShouldHaveValidationErrorFor("LaCodes[1]")
            .WithErrorMessage(expectedErrorMessage);
    }

    [Theory]
    [InlineData("E1", "Requesting Local Authority code has a minimum length of 3")]
    [InlineData("E112345678910111", "Requesting Local Authority code has a maximum length of 15")]
    public void InvalidRequestingLaCode_ShouldBeInvalid(string requestingLaCode, string expectedErrorMessage)
    {
        var result = _validator.TestValidate(BuildRequest(["E08000014"], requestingLaCode));
        result.ShouldHaveValidationErrorFor(r => r.RequestingLaCode)
            .WithErrorMessage(expectedErrorMessage);
    }
}
