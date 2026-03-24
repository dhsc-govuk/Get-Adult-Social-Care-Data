using core.Data;
using core.Data.Models;
using core.Reader;
using Microsoft.Extensions.DependencyInjection;

namespace importer.Services;

public class DbWriter(IServiceProvider serviceProvider)
{
    Dictionary<String, User> _users = new();
    Dictionary<String, Location> _locations = new();
    List<Role> _roles = new();
    
    public void WriteContacts(IEnumerable<ContactRow> contacts)
    {
        foreach (var contact in contacts)
        {
            var user =  GetUser(contact);
            var location = GetLocation(contact);
            _users[user.Email] = user;
            _locations[location.Code] = location;
            _roles.Add(GetRole(contact, user, location));
        }
        
        WriteToDatabase();
    }

    private User GetUser(ContactRow contact)
    {
        return _users.ContainsKey(contact.Email) ? _users[contact.Email] : 
            new User { Name = contact.Name, Email = contact.Email, };
    }

    private Location GetLocation(ContactRow contact)
    {
        return _locations.ContainsKey(contact.LocationId) ? _locations[contact.LocationId] : 
            new Location { Code = contact.LocationId, Name = contact.LocationName, Type = contact.LocationType };
    }

    private Role GetRole(ContactRow contact, User user, Location location)
    {
        return new Role { RoleType = contact.Role, User = user, Location = location };
    }

    private void WriteToDatabase()
    {
        var scope = serviceProvider.CreateScope();
        using (var context = scope.ServiceProvider.GetRequiredService<NiDataContext>())
        {
            context.AddRange(_users.Values);
            context.AddRange(_locations.Values);
            context.AddRange(_roles); 
            context.SaveChanges();   
        }
    }
}