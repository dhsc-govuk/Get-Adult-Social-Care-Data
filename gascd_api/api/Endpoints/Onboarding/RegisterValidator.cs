using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Onboarding;

public class RegisterValidator : Validator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(x => x.RegFullName)
            .NotEmpty().WithMessage("Full name is required")
            .MaximumLength(100).WithMessage("Full name has a maximum length of 100");

        RuleFor(x => x.RegLa)
            .NotEmpty().WithMessage("Local authority is required")
            .MaximumLength(50).WithMessage("Local authority has a maximum length of 50");

        RuleFor(x => x.RegMail)
            .NotEmpty().WithMessage("Email address is required")
            .EmailAddress().WithMessage("Email address is not valid")
            .MaximumLength(254).WithMessage("Email address has a maximum length of 254");

        RuleFor(x => x.RegOrgName)
            .NotEmpty().WithMessage("Organisation name is required")
            .MaximumLength(150).WithMessage("Organisation name has a maximum length of 150");

        RuleFor(x => x.RegRole)
            .NotEmpty().WithMessage("Role is required")
            .MaximumLength(100).WithMessage("Role has a maximum length of 100");
    }
}
