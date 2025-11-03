using FastEndpoints;
using FastEndpoints.Swagger;
using gascd_api.Data;
using gascd_api.Data.Mappers;
using Microsoft.EntityFrameworkCore;

var bld = WebApplication.CreateBuilder();

bld.Services
    .AddDbContext<GascdDataContext>(o => o.UseNpgsql(bld.Configuration.GetConnectionString("DefaultConnection")))
    .AddFastEndpoints()
    .SwaggerDocument()
    .AddSingleton<PostcodeMapper>();

var app = bld.Build();
app.UseFastEndpoints(c => c.Errors.UseProblemDetails())
.UseSwaggerGen();

app.Run();