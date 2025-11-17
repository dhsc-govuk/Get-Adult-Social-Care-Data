using api.Configuration;
using api.Data.Mappers;
using api.Logging;
using FastEndpoints.Swagger;

var bld = WebApplication.CreateBuilder();

bld.Logging.RegisterLoggingConfiguration();

bld.Services
    .RegisterDatabase(bld.Configuration)
    .RegisterFastEndpoints()
    .AddSingleton<PostcodeMapper>()
    .RegisterSwaggerConfiguration()
    .RegisterAuth();

var app = bld.Build();
app.UseMiddleware<LogContextMiddleware>()
    .RegisterFastEndpoints()
    .RegisterAuth()
    .UseSwaggerGen();

app.Run();