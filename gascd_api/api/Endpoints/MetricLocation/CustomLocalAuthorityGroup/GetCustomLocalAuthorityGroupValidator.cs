using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.CustomLocalAuthorityGroup;

public class GetCustomLocalAuthorityGroupValidator : Validator<GetCustomLocalAuthorityGroupRequest>
{
    public GetCustomLocalAuthorityGroupValidator()
    {
        RuleFor(x => x.LaCodes)
            .NotEmpty().WithMessage("At least one Local Authority code is required");

        RuleFor(x => x.LaCodes)
            .Must(x => x.Count <= GetCustomLocalAuthorityGroupEndpoint.MaxLaCodes)
            .WithMessage($"A maximum of {GetCustomLocalAuthorityGroupEndpoint.MaxLaCodes} Local Authority codes can be requested")
            .When(x => x.LaCodes is not null);

        RuleForEach(x => x.LaCodes)
            .NotEmpty().WithMessage("Local Authority code is required")
            .MinimumLength(3).WithMessage("Local Authority code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Local Authority code has a maximum length of 15")
            .When(x => x.LaCodes is not null, ApplyConditionTo.AllValidators);

        RuleFor(x => x.RequestingLaCode)
            .MinimumLength(3).WithMessage("Requesting Local Authority code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Requesting Local Authority code has a maximum length of 15")
            .When(x => !string.IsNullOrEmpty(x.RequestingLaCode));
    }
}
