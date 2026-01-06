using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.Countries;

public class GetCountryValidator : Validator<GetCountryRequest>
{
    public GetCountryValidator()
    {
        RuleFor(x => x.CountryCode)
            .NotEmpty().WithMessage("Country code is required")
            .MinimumLength(3).WithMessage("Country code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Country code has a maximum length of 15");
    }
}