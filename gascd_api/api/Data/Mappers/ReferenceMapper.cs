using api.Data.Models.Reference;
using api.Endpoints.Geo.Postcode;
using api.Endpoints.MetricLocation.CpLocations;
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

    public GetCareProviderResponse CareProviderLocationToGetCareProviderResponse(
        CareProviderLocation careProviderLocation)
    {
        return new GetCareProviderResponse
        {
            LocationName = careProviderLocation.Name,
            LocationId = careProviderLocation.Code
        };
    }

    public GetCareProviderLocationResponse CareProviderLocationToGetCareProviderLocationResponse(CareProviderLocation cpl)
    {
        return new GetCareProviderLocationResponse
        {
            Id = cpl.Code,
            DisplayName = cpl.Name,
            Address = cpl.Address,
            ProviderId = cpl.CareProvider.Code,
            ProviderName = cpl.CareProvider.Name,
            NominatedIndividual = cpl.NominatedIndividual,
            LocalAuthorityId = cpl.LocalAuthority.Code,
        };
    }
}