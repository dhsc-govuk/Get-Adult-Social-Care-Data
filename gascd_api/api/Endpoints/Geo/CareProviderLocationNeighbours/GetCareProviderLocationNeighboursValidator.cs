using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursValidator : Validator<GetCareProviderLocationNeighboursRequest>
{
    public GetCareProviderLocationNeighboursValidator()
    {
        RuleFor(x => x.CareProviderLocationCode)
            .NotEmpty().WithMessage("Care provider location code is required")
            .MinimumLength(3).WithMessage("Care provider location code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Care provider location code has a maximum length of 15");

        RuleFor(x => x.DistanceInKm)
            .Must(value => value >= 0)
            .WithMessage("The distance must be greater than zero");

        RuleFor(x => x.Limit)
            .Must(value => value >= 0)
            .WithMessage("The limit must be greater than zero");
    }
}