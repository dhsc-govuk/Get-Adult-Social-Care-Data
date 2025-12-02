using api.Data.Models.reference;
using api.Endpoints.Geo.Postcode;

namespace api.Data.Mappers;

public class PostcodeMapper
{
    public GetPostcodeResponse PostcodeToGetPostcodeResponse(Postcode postcode)
    {
        return new GetPostcodeResponse()
        {
            SanitisedPostcode = postcode.Id,
            DisplayPostcode = postcode.DisplayPostcode,
            Latitude = postcode.Latitude,
            Longitude = postcode.Longitude,
            LaCode = postcode.LocalAuthorityFk
        };
    }
}