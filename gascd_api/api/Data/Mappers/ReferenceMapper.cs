using api.Data.Models.Reference;
using api.Endpoints.Geo.Postcode;
using api.Endpoints.Organisation.CareProvider;

namespace api.Data.Mappers;

public class ReferenceMapper
{
    public GetPostcodeResponse PostcodeToGetPostcodeResponse(Postcode postcode)
    {
        return new GetPostcodeResponse
        {
            SanitisedPostcode = postcode.Code,
            DisplayPostcode = postcode.DisplayPostcode,
            Latitude = postcode.Coordinate.X,
            Longitude = postcode.Coordinate.Y,
            LaCode = postcode.LocalAuthority.Code,
            LaName = postcode.LocalAuthority.Name
        };
    }

    public GetCareProviderResponse CareProviderToGetCareProviderResponse(CareProvider careProvider)
    {
        return new GetCareProviderResponse
        {
            DisplayName = careProvider.Name,
            Locations = careProvider.CareProviderLocations
                .Select(CareProviderLocationToCareProviderLocationResponse).ToList()
        };
    }

    public GetCareProviderResponse.CareProviderLocation CareProviderLocationToCareProviderLocationResponse(CareProviderLocation careProviderLocation)
    {
        return new GetCareProviderResponse.CareProviderLocation
        {
            LocationName = careProviderLocation.Name,
            LocationId = careProviderLocation.Code
        };
    }
}