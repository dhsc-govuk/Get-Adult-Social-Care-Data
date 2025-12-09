using api.Data.Models.Reference;
using api.Endpoints.Geo.Postcode;

namespace api.Data.Mappers;

public class PostcodeMapper
{
    public GetPostcodeResponse PostcodeToGetPostcodeResponse(Postcode postcode)
    {
        return new GetPostcodeResponse
        {
            SanitisedPostcode = postcode.Code,
            DisplayPostcode = postcode.DisplayPostcode,
            Latitude = postcode.Latitude,
            Longitude = postcode.Longitude,
            LaCode = postcode.LocalAuthority.Code,
            LaName = postcode.LocalAuthority.Name
        };
    }
}