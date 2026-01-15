using api.Endpoints.MetricFilters;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.MetricFilters;

public class GetMetricFiltersValidatorTests : IDisposable
{
    private GetMetricFiltersValidator _validator;

    public GetMetricFiltersValidatorTests()
    {
        _validator = new GetMetricFiltersValidator();
    }

    [Theory]
    [InlineData("E11")]
    [InlineData("E1123456789")]
    [InlineData("E41234567891011")]
    public void ValidMetricGroupCode_ShouldBeValid(string code)
    {
        var request = new GetMetricFiltersRequest { MetricGroupCode = code };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("AY", "Metric group code has a minimum length of 3")]
    [InlineData(" ", "Metric group code is required")]
    [InlineData("this-is-a-very-long-group-code-without-any-possible-chance-of-being-valid-as-it-is-just-far-tooo-long",
        "Metric group code has a maximum length of 100")]
    public void InvalidMetricGroupCode_ShouldBeInvalid(string code, string expectedErrorMessage)
    {
        var request = new GetMetricFiltersRequest { MetricGroupCode = code };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.MetricGroupCode)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}