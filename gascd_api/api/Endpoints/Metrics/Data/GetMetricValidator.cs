using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Metrics.Data;

public class GetMetricValidator : Validator<GetMetricRequest>
{
    public GetMetricValidator()
    {
        RuleForEach(r => r.Locations)
            .SetValidator(new GetMetricLocationsValidator());

    }
}

public class GetMetricLocationsValidator : Validator<GetMetricRequest.Location>
{
    public GetMetricLocationsValidator()
    {
        RuleFor(r => r.LocationCode)
            .NotEmpty().WithMessage("Location code is required")
            .MinimumLength(3).WithMessage("Location code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Location code has a maximum length of 15");
    }
}