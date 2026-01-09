using api.Endpoints.Geo.Postcode;
using FluentValidation.TestHelper;

namespace api.Tests.Endpoints.Geo.Postcode;

public class GetPostcodeValidatorTests : IDisposable
{
    private GetPostcodeValidator _validator;

    public GetPostcodeValidatorTests()
    {
        _validator = new GetPostcodeValidator();
    }

    [Theory]
    [InlineData("N14BJ")]
    [InlineData("NE14BJ")]
    [InlineData("NE124BJ")]
    public void ValidPostcode_ShouldBeValid(string postcode)
    {
        var request = new GetPostcodeRequest { Postcode = postcode };
        var result = _validator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("NE14BJ!", "Postcode includes invalid characters")]
    [InlineData("1234", "Postcode should have a minimum of length of 5")]
    [InlineData("12345678", "Postcode should have a maximum of length of 7")]
    [InlineData("1234;", "Postcode includes invalid characters")]
    [InlineData("1234$", "Postcode includes invalid characters")]
    [InlineData("1234@", "Postcode includes invalid characters")]
    public void InvalidPostcode_ShouldBeInvalid(string postcodeInput, string expectedErrorMessage)
    {
        var request = new GetPostcodeRequest { Postcode = postcodeInput };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.Postcode)
            .WithErrorMessage(expectedErrorMessage);
    }

    public void Dispose()
    {

    }
}