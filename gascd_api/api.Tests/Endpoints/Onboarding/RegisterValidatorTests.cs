using api.Endpoints.Onboarding;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.Onboarding;

public class RegisterValidatorTests
{
    private readonly RegisterValidator _validator = new();

    [Fact]
    public void Valid_RegistrationRequest_NoErrors()
    {
        var request = ValidRequest();
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("", "Full name is required", nameof(RegisterRequest.RegFullName))]
    [InlineData(" ", "Full name is required", nameof(RegisterRequest.RegFullName))]
    [InlineData("", "Email address is required", nameof(RegisterRequest.RegMail))]
    [InlineData("not-an-email", "Email address is not valid", nameof(RegisterRequest.RegMail))]
    public void Invalid_Field(string value, string expectedMessage, string property)
    {
        var request = ValidRequest();
        typeof(RegisterRequest).GetProperty(property)!.SetValue(request, value);
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(property)
            .WithErrorMessage(expectedMessage);
    }

    private static RegisterRequest ValidRequest() => new()
    {
        RegFullName = "Jane Smith",
        RegMail = "jane.smith@example.com"
    };
}
