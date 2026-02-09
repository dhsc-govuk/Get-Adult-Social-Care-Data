using FastEndpoints;
using System.Reflection;

namespace api.Processors;

public class VersionHandler : IGlobalPreProcessor
{
    private readonly string? _version;
    private readonly ILogger<VersionHandler> _logger;

    public VersionHandler(ILogger<VersionHandler> logger)
    {
        _version = GetInformationalVersion();
        _logger = logger;
    }

    public Task PreProcessAsync(IPreProcessorContext context, CancellationToken ct)
    {
        try
        {
            context.HttpContext.Response.Headers.TryAdd("x-version", _version);
        }
        catch (Exception e)
        {
            _logger.LogWarning(e, "Failed to add version to http header response");
        }
        return Task.CompletedTask;
    }

    private string? GetInformationalVersion()
    {
        return Assembly.GetEntryAssembly()?
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
            .InformationalVersion;
    }
}