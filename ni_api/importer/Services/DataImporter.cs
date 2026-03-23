using core.Reader;
using Microsoft.Extensions.Hosting;

namespace importer.Services;

public class DataImporter(IHostApplicationLifetime lifetime, DbWriter writer) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("starting data importer!!");
        var row = new ContactRow()
        {
            LocationId = "1-10000302982",
            LocationName = "My Organisation",
            LocationType = "Location",
            Role = "Registered Manager",
            Name = "Mr Test Person",
            Email = "test@testing.com"
        };
        
        writer.WriteContact(row);
        
        Console.WriteLine("omg it worked!!");
        
        lifetime.StopApplication();
        return Task.CompletedTask;
    }
    
    public Task StopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("stopping!!");
        return Task.CompletedTask;
    }
}