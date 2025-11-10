using api.Auth;
using api.Data;
using api.Data.Mappers;
using api.Logging;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using NSwag;

var bld = WebApplication.CreateBuilder();

bld.Logging
    .ClearProviders()
    .AddJsonConsole(o =>
        {
            o.TimestampFormat = "[HH:mm:ss] ";
            o.IncludeScopes = true;
        }
    )
    .AddDebug()
    .SetMinimumLevel(LogLevel.Information);

bld.Services
    .AddDbContext<GascdDataContext>(o => o.UseNpgsql(bld.Configuration.GetConnectionString("DefaultConnection")))
    .AddFastEndpoints()
    .AddSingleton<PostcodeMapper>()
    .AddHttpContextAccessor()
    .AddTransient(typeof(ApiLogger<>))
    .SwaggerDocument(o =>
    {
        o.EnableJWTBearerAuth = false;
        o.DocumentSettings = s =>
        {
            s.AddAuth(ApiKeyAuth.SchemeName, new()
            {
                Name = ApiKeyAuth.HeaderName,
                In = OpenApiSecurityApiKeyLocation.Header,
                Type = OpenApiSecuritySchemeType.ApiKey
            });
        };
    })
    .AddAuthorization()
    .AddAuthentication(ApiKeyAuth.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, ApiKeyAuth>(ApiKeyAuth.SchemeName, null);

var app = bld.Build();
app
    .UseFastEndpoints(c =>
    {
        c.Errors.UseProblemDetails();
        c.Endpoints.Configurator = ep => ep.PreProcessor<LogPreProcessor>(Order.Before);
    })
    .UseAuthentication()
    .UseAuthorization()
    .UseSwaggerGen();

app.Run();