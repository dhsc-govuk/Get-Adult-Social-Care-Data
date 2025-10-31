using FastEndpoints;
using FastEndpoints.Swagger;
using gascd_api;
using gascd_api.Data;
using Microsoft.EntityFrameworkCore;

var bld = WebApplication.CreateBuilder();

bld.Services
    .AddDbContext<GascdDataContext>(o => o.UseNpgsql(bld.Configuration.GetConnectionString("DefaultConnection")))
    .AddFastEndpoints()
    .SwaggerDocument();

var app = bld.Build();
app.UseFastEndpoints(c => c.Errors.UseProblemDetails())
.UseSwaggerGen();

app.Run();