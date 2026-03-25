using importer.Reader;
using Microsoft.Extensions.Hosting;

namespace importer.Services;

public class DataImporter(IHostApplicationLifetime lifetime, DbWriter writer) : IHostedService, IAsyncDisposable
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
        
        writer.WriteContacts(new List<ContactRow>{ row });
        
        Console.WriteLine("omg it worked!!");
        
        lifetime.StopApplication();
        return Task.CompletedTask;
    }
    
    public Task StopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("stopping!!");
        return Task.CompletedTask;
    }

    public ValueTask DisposeAsync()
    {
        throw new NotImplementedException();
    }
}