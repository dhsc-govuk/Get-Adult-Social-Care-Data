using FluentValidation.TestHelper;
using gascd_api.Properties.Features.Geo.Postcode;

namespace gascd_api.Test.Properties.Features.Geo.Postcode;

public class GetPostcodeValidatorTest : IDisposable
{
    private GetPostcodeValidator _validator;

    public GetPostcodeValidatorTest()
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