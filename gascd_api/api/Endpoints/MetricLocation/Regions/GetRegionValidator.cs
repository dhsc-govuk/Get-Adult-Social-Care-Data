using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.Regions;

public class GetRegionValidator : Validator<GetRegionRequest>
{
    public GetRegionValidator()
    {
        RuleFor(x => x.RegionCode)
            .NotEmpty().WithMessage("Region code is required")
            .MinimumLength(3).WithMessage("Region code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Region code has a maximum length of 15");
    }
}