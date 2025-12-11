using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderValidator : Validator<GetCareProviderRequest>
{
    public GetCareProviderValidator()
    {
        RuleFor(x => x.CareProviderCode)
            .NotEmpty().WithMessage("Care provider code is required")
            .MinimumLength(3).WithMessage("Care provider code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Care provider code has a maximum length of 15");
    }
}