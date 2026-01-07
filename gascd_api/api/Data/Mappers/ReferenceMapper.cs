using api.Data.Models.Metrics;
using api.Data.Models.Reference;
using api.Endpoints.Geo.Postcode;
using api.Endpoints.MetricFilters;
using api.Endpoints.MetricLocation.Countries;
using api.Endpoints.MetricLocation.LocalAuthorities;
using api.Endpoints.MetricLocation.Regions;
using api.Endpoints.Metrics.Metadata;
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

    private GetCareProviderResponse.CareProviderLocation CareProviderLocationToCareProviderLocationResponse(CareProviderLocation careProviderLocation)
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

    private GeoDataDto GeoDataToGeoDataDto(GeoData geoData)
    {
        return new GeoDataDto
        {
            Latitude = geoData.Coordinate.Y,
            Longitude = geoData.Coordinate.X,
            Polygon = geoData.BoundingPolygon?.Coordinates
                .Select(c => new GeoDataDto.CoordinateDto { Latitude = c.X, Longitude = c.Y }).ToList() ?? new()
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
            RegionName = la.Region?.Name,
            CountryCode = la.Region?.Country?.Code,
            CountryName = la.Region?.Country?.Name,
        };
    }

    public GetRegionResponse RegionToGetRegionResponse(Region region)
    {
        return new GetRegionResponse
        {
            Code = region.Code,
            DisplayName = region.Name,
            GeoData = GeoDataToGeoDataDto(region.GeoData),
            CountryCode = region.Country.Code,
            CountryName = region.Country.Name,
        };
    }

    public GetCountryResponse CountryToGetCountryResponse(Country country)
    {
        return new GetCountryResponse
        {
            Code = country.Code,
            DisplayName = country.Name,
            GeoData = GeoDataToGeoDataDto(country.GeoData),
        };
    }

    public GetMetricMetadataResponse MetricToGetMetricMetadataResponse(Metric metric)
    {
        return new GetMetricMetadataResponse
        {
            MetricCode = metric.Code,
            MetricName = metric.DisplayName,
            DataType = metric.DataType,
            DataSource = metric.DataSource,
            Numerator = metric.NumeratorDescription,
            Denominator = metric.DenominatorDescription,
        };
    }

    public GetMetricFiltersResponse MetricGroupToMetricFiltersResponse(MetricGroup metricGroup)
    {
        return new GetMetricFiltersResponse
        {
            MetricGroupCode = metricGroup.Code,
            MetricFilters = metricGroup.Metrics
                .Select(MetricToMetricFilterDto).ToList()
        };
    }

    private GetMetricFiltersResponse.MetricFilterDto MetricToMetricFilterDto(Metric metric)
    {
        return new GetMetricFiltersResponse.MetricFilterDto
        {
            MetricCode = metric.Code,
            DisplayName = metric.DisplayName
        };
    }

}