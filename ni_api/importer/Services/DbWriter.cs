using core.Data;
using core.Data.Models;
using core.Reader;
using Microsoft.Extensions.DependencyInjection;

namespace importer.Services;

public class DbWriter(IServiceProvider serviceProvider) : IDisposable
{
    public void WriteContacts(IEnumerable<ContactRow> contacts)
    {
        List<User> users = new();
        List<Location> locations = new();
        List<Role> roles = new();
        foreach (var contact in contacts)
        {
            var user =  GetUser(contact);
            var location = GetLocation(contact);
            users.Add(user);
            locations.Add(location);
            roles.Add(GetRole(contact, user, location));
        }
        
        WriteToDatabase(users, locations, roles);
    }

    private User GetUser(ContactRow contact)
    {
        return new User { Name = contact.Name, Email = contact.Email, };
    }

    private Location GetLocation(ContactRow contact)
    {
        return new Location { Code = contact.LocationId, Name = contact.LocationName, Type = contact.LocationType };
    }

    private Role GetRole(ContactRow contact, User user, Location location)
    {
        return new Role { RoleType = contact.Role, User = user, Location = location };
    }

    private void WriteToDatabase(IEnumerable<User> users, IEnumerable<Location> locations, IEnumerable<Role> roles)
    {
        var scope = serviceProvider.CreateScope();
        using (var context = scope.ServiceProvider.GetRequiredService<NiDataContext>())
        {
            context.AddRange(users);
            context.AddRange(locations);
            context.AddRange(roles); 
            context.SaveChanges();   
        }
    }

    public void Dispose()
    {
    }
}