using api.Configuration;
using api.Data.Mappers;
using FastEndpoints.Swagger;

var bld = WebApplication.CreateBuilder();

bld.Logging.RegisterLoggingConfiguration();

bld.Services
    .RegisterDatabase(bld.Configuration)
    .RegisterFastEndpoints()
    .AddSingleton<PostcodeMapper>()
    .RegisterLoggingServices()
    .RegisterSwaggerConfiguration()
    .RegisterAuth();

var app = bld.Build();
app
    .RegisterFastEndpoints()
    .RegisterAuth()
    .UseSwaggerGen();

app.Run();