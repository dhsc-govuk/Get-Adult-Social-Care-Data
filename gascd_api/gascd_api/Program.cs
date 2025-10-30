using FastEndpoints;
using FastEndpoints.Swagger;
using gascd_api;
using Microsoft.EntityFrameworkCore;

var bld = WebApplication.CreateBuilder();

bld.Services
    .AddFastEndpoints()
    .SwaggerDocument();

var app = bld.Build();
app.UseFastEndpoints(c => c.Errors.UseProblemDetails())
.UseSwaggerGen();

app.Run();