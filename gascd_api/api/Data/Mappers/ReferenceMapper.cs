using api.Data.Models.Reference;
using api.Endpoints.Geo.Postcode;
using api.Endpoints.MetricLocation.LocalAuthorities;
using api.Endpoints.Organisation.CareProvider;
using api.Endpoints.Shared;

namespace api.Data.Mappers;

public class ReferenceMapper
{
    public GetPostcodeResponse PostcodeToGetPostcodeResponse(Postcode postcode)
    {
        return new GetPostcodeResponse
        {
            SanitisedPostcode = postcode.Code,
            DisplayPostcode = postcode.DisplayPostcode,
            GeoData = GeoDataToGeoDataDto(postcode.GeoData),
            LaCode = postcode.LocalAuthority.Code,
            LaName = postcode.LocalAuthority.Name
        };
    }

    public GetCareProviderResponse CareProviderToGetCareProviderResponse(CareProvider careProvider)
    {
        return new GetCareProviderResponse
        {
            Code = careProvider.Code,
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
            LocationCode = careProviderLocation.Code
        };
    }

    public GetCareProviderLocationResponse CareProviderLocationToGetCareProviderLocationResponse(CareProviderLocation cpl)
    {
        return new GetCareProviderLocationResponse
        {
            Code = cpl.Code,
            DisplayName = cpl.Name,
            Address = cpl.Address,
            ProviderCode = cpl.CareProvider.Code,
            ProviderName = cpl.CareProvider.Name,
            NominatedIndividual = cpl.NominatedIndividual,
            GeoData = GeoDataToGeoDataDto(cpl.GeoData),
            LocalAuthorityCode = cpl.LocalAuthority?.Code,
            LocalAuthorityName = cpl.LocalAuthority?.Name,
            RegionCode = cpl.LocalAuthority?.Region.Code,
            RegionName = cpl.LocalAuthority?.Region.Name,
            CountryCode = cpl.LocalAuthority?.Region.Country.Code,
            CountryName = cpl.LocalAuthority?.Region.Country.Name,
        };
    }

    public GeoDataDto GeoDataToGeoDataDto(GeoData geoData)
    {
        return new GeoDataDto
        {
            Latitude = geoData.Coordinate.Y,
            Longitude = geoData.Coordinate.X,
            Polygon = geoData.BoundingPolygon?.Coordinates
                .Select(c => new GeoDataDto.CoordinateDto { Latitude = c.X, Longitude = c.Y }).ToList()
        };
    }

    public GetLocalAuthorityResponse LocalAuthorityToGetLocalAuthorityResponse(LocalAuthority la)
    {
        return new GetLocalAuthorityResponse
        {
            Code = la.Code,
            DisplayName = la.Name,
            GeoData = GeoDataToGeoDataDto(la.GeoData),
            RegionCode = la.Region?.Code,
            CountryCode = la.Region?.Country?.Code,
        };
    }
}