using core.Data;
using core.Data.Models;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.GetLocations;

public class GetLocationsEndpoint(NiDataContext context) : Endpoint<GetLocationsRequest, GetLocationsResponse>
{
    public override void Configure()
    {
        Get("/api/locations");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetLocationsRequest req, CancellationToken ct)
    {
        var user = context.Users
            .Include(u => u.Roles)
            .ThenInclude(r => r.Location)
            .SingleOrDefault(u => u.Email == req.Email);

        var locations = user.Roles.Select(role => new GetLocationsResponse.Location{ Code = role.Location.Code }).ToList();
        
        var response = new GetLocationsResponse
        {
            Email =  req.Email,
            Locations = locations
        };
        await Send.OkAsync(response, ct);
    }
}