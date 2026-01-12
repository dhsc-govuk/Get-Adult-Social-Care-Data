using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Metrics.Metadata;

public class GetMetricMetadataValidator : Validator<GetMetricMetadataRequest>
{
    public GetMetricMetadataValidator()
    {
        RuleFor(x => x.MetricCode)
            .NotEmpty().WithMessage("Metric code is required")
            .MinimumLength(3).WithMessage("Metric code has a minimum length of 3")
            .MaximumLength(100).WithMessage("Metric code has a maximum length of 100");
    }
}