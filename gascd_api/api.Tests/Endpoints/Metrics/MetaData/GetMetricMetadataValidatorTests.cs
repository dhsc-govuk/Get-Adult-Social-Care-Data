using api.Endpoints.Metrics.Metadata;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.Metrics.MetaData;

public class GetMetricMetadataValidatorTests
{
    private GetMetricMetadataValidator _validator = new();

    [Theory]
    [InlineData("metric")]
    [InlineData("metric_code")]
    [InlineData("metric code")]
    public void ValidMetricCode_ShouldBeValid(string metricCode)
    {
        var request = new GetMetricMetadataRequest { MetricCode = metricCode };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("co", "Metric code has a minimum length of 3")]
    [InlineData(" ", "Metric code is required")]
    [InlineData("this-is-a-very-long-metric-code-without-any-possible-chance-of-being-valid-as-it-is-just-far-too-long", "Metric code has a maximum length of 100")]
    public void InvalidLACode_ShouldBeInvalid(string cplCode, string expectedErrorMessage)
    {
        var request = new GetMetricMetadataRequest { MetricCode = cplCode };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.MetricCode)
            .WithErrorMessage(expectedErrorMessage);
    }
}