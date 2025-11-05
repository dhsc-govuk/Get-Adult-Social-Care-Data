using FluentValidation.TestHelper;
using gascd_api.Endpoints.Geo.Postcode;

namespace gascd_api.Tests.Endpoints.Geo.Postcode;

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
    [InlineData("NE14BJ!")]
    [InlineData("1234")]
    [InlineData("12345678")]
    [InlineData("1234;")]
    [InlineData("1234$")]
    [InlineData("1234@")]
    public void InvalidPostcode_ShouldBeInvalid(string postcodeInput)
    {
        var request = new GetPostcodeRequest { Postcode = postcodeInput };
        var result = _validator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(r => r.Postcode)
            .WithErrorMessage("Invalid postcode.");
    }

    public void Dispose()
    {

    }
}