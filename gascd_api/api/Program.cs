using api.Auth;
using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using NSwag;

var bld = WebApplication.CreateBuilder();

bld.Services
    .AddDbContext<GascdDataContext>(o => o.UseNpgsql(bld.Configuration.GetConnectionString("DefaultConnection")))
    .AddFastEndpoints()
    .AddSingleton<PostcodeMapper>()
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
    .UseFastEndpoints(c => c.Errors.UseProblemDetails())
    .UseAuthentication()
    .UseAuthorization()
    .UseSwaggerGen();

app.Run();