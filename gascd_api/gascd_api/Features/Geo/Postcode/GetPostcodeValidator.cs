using FastEndpoints;
using FluentValidation;

namespace gascd_api.Features.Geo.Postcode;

public class GetPostcodeValidator : Validator<GetPostcodeRequest>
{
    public GetPostcodeValidator()
    {
        RuleFor(x => x.Postcode)
            .NotEmpty().WithMessage("Postcode is required.")
            .MinimumLength(5).WithMessage("Invalid postcode.")
            .MaximumLength(7).WithMessage("Invalid postcode.")
            .Matches("^[A-Z0-9]+$").WithMessage("Invalid postcode.");
    }
}