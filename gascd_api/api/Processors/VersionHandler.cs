using FastEndpoints;
using System.Reflection;

namespace api.Processors;

public class VersionHandler : IGlobalPreProcessor
{
    public Task PreProcessAsync(IPreProcessorContext context, CancellationToken ct)
    {
        var version = GetInformationalVersion();
        context.HttpContext.Response.Headers.TryAdd("x-version", version);
        return Task.CompletedTask;
    }

    private string? GetInformationalVersion()
    {
        return Assembly.GetEntryAssembly()?
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
            .InformationalVersion;
    }
}