using importer.Reader;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace importer.Services;

public class DataImporter(IHostApplicationLifetime lifetime, DbWriter writer, IConfiguration config) : IHostedService, IAsyncDisposable
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("starting data importer!!");

        var fileName = config["CQCFile"] ?? throw new InvalidOperationException("CQCFile not set");

        List<ContactRow> contactRows;
        using (var fileStream = new FileStream(fileName, FileMode.Open, FileAccess.Read))
        {
            var reader = new ExcelReader(fileStream);
            contactRows = reader.ProcessFile();
        }
        
        Console.WriteLine("Read file completed!!");
        
        writer.WriteContacts(contactRows);
        
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
        Console.WriteLine("Disposing!!");
        return ValueTask.CompletedTask;
    }
}