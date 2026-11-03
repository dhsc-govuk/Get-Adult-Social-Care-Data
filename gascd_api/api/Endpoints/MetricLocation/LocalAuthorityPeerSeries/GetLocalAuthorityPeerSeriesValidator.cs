using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.LocalAuthorityPeerSeries;

public class GetLocalAuthorityPeerSeriesValidator : Validator<GetLocalAuthorityPeerSeriesRequest>
{
    public GetLocalAuthorityPeerSeriesValidator()
    {
        RuleFor(x => x.LocalAuthorityCode)
            .NotEmpty().WithMessage("Local Authority code is required")
            .MinimumLength(3).WithMessage("Local Authority code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Local Authority code has a maximum length of 15");

        RuleFor(x => x.MetricCodes)
            .NotEmpty().WithMessage("At least one metric code is required");
    }
}
