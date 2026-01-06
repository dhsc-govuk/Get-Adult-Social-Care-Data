using api.Endpoints.Metrics.Metadata;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.Metrics.MetaData;

public class GetMetricMetadataValidatorTests : IDisposable
{
    private GetMetricMetadataValidator _validator;

    public GetMetricMetadataValidatorTests()
    {
        _validator = new GetMetricMetadataValidator();
    }

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
    [InlineData("a-very-long-name-over-one-hundred-characters-long-a-very-long-name-over-one-hundred-characters-long-a-very-long-name-over-one-hundred-characters-long-a-very-long-name-over-one-hundred-characters-long", "Metric code has a maximum length of 100")]
    public void InvalidLACode_ShouldBeInvalid(string cplCode, string expectedErrorMessage)
    {
        var request = new GetMetricMetadataRequest { MetricCode = cplCode };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.MetricCode)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}