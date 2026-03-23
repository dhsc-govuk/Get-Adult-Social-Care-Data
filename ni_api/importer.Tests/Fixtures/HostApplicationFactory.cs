using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace importer.Tests.Fixtures;

public class HostApplicationFactory<TEntryPoint> : WebApplicationFactory<TEntryPoint> 
    where TEntryPoint : class
{
    private readonly Action<IWebHostBuilder> _configuration;

    public HostApplicationFactory(Action<IWebHostBuilder> configuration)
    {
        _configuration = configuration;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        _configuration(builder.Configure(_ => { }));

    public Task RunHostAsync()
    {
        var host = Services.GetRequiredService<IHost>();
        return host.WaitForShutdownAsync();
    }
}