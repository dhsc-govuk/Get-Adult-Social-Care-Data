using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricFilters;

public class GetMetricFiltersValidator : Validator<GetMetricFiltersRequest>
{
    public GetMetricFiltersValidator()
    {
        RuleFor(x => x.MetricGroupCode)
            .NotEmpty().WithMessage("Metric group code is required")
            .MinimumLength(3).WithMessage("Metric group code has a minimum length of 3")
            .MaximumLength(100).WithMessage("Metric group code has a maximum length of 100");
    }
}