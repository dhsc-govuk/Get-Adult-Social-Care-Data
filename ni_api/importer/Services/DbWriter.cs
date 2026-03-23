using core.Data;
using core.Data.Models;
using core.Reader;

namespace importer.Services;

public class DbWriter(NiDataContext context)
{
    public void WriteContact(ContactRow contact)
    {
        var user = GetUser(contact);
        var location = GetLocation(contact);
        var role = GetRole(contact, user, location);
        
        context.Add(user);
        context.Add(location);
        context.Add(role);
        context.SaveChanges();
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
}