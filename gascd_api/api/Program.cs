using api.Configuration;
using api.Processors;
using FastEndpoints.Swagger;

var bld = WebApplication.CreateBuilder();

bld.Logging.RegisterLoggingConfiguration();

bld.Services
    .RegisterDatabase(bld.Configuration)
    .RegisterFastEndpoints(bld.Configuration)
    .AddSingletonConfiguration()
    .AddScopedConfiguration()
    .AddOpenTelemetryConfiguration(bld.Configuration)
    .RegisterSwaggerConfiguration()
    .RegisterAuth();

var app = bld.Build();
app.UseMiddleware<LogContextMiddleware>()
    .RegisterFastEndpoints()
    .RegisterAuth()
    .UseSwaggerGen();

app.Run();