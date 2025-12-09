using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderValidator : Validator<GetCareProviderRequest>
{
    public GetCareProviderValidator()
    {
        RuleFor(x => x.CareProviderId)
            .NotEmpty().WithMessage("Care provider ID is required")
            .MinimumLength(3).WithMessage("Care provider ID has a minimum length of 3")
            .MaximumLength(15).WithMessage("Care provider ID has a maximum length of 15");
    }
}