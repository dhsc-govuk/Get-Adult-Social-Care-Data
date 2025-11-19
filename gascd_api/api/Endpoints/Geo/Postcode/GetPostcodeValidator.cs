using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Geo.Postcode;

public class GetPostcodeValidator : Validator<GetPostcodeRequest>
{
    public GetPostcodeValidator()
    {
        RuleFor(x => x.Postcode)
            .NotEmpty().WithMessage("Postcode is required.")
            .MinimumLength(5).WithMessage("Postcode should have a minimum of length of 5")
            .MaximumLength(7).WithMessage("Postcode should have a maximum of length of 7")
            .Matches("^[A-Z0-9]+$").WithMessage("Postcode includes invalid characters");
    }
}