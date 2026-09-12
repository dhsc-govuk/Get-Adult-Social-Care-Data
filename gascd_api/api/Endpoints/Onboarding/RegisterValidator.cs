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

        RuleFor(x => x.RegMail)
            .NotEmpty().WithMessage("Email address is required")
            .EmailAddress().WithMessage("Email address is not valid")
            .MaximumLength(254).WithMessage("Email address has a maximum length of 254");
    }
}
