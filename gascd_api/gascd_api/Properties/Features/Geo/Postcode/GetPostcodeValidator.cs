using FastEndpoints;
using FluentValidation;

namespace gascd_api.Properties.Features.Geo.Postcode;

public class GetPostcodeValidator :Validator<GetPostcodeRequest>
{
    public GetPostcodeValidator()
    {
        RuleFor(x => x.Postcode).NotEmpty().WithMessage("Postcode is required.");
    }
}
