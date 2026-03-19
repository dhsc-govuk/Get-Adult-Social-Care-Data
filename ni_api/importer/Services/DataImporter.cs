using Microsoft.Extensions.Hosting;

namespace importer.Services;

public class DataImporter(IHostApplicationLifetime lifetime) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("hello");
        
        lifetime.StopApplication();
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        Console.WriteLine("stopping!!");
        return Task.CompletedTask;
    }
}