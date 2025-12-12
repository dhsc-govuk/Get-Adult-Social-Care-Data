using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationValidator : Validator<GetCareProviderLocationRequest>
{
    public GetCareProviderLocationValidator()
    {
        RuleFor(x => x.CareProviderLocationCode)
            .NotEmpty().WithMessage("Care provider location code is required")
            .MinimumLength(3).WithMessage("Care provider location code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Care provider location code has a maximum length of 15");
    }
}