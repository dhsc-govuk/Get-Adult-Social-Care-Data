using core.Data;
using importer.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile($"appsettings.{builder.Environment}.json", optional: true);

builder.Services
    .AddDbContext<NiDataContext>(o =>
    {
        o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
            p => p.MigrationsAssembly("importer"));
    })
    .AddHostedService<DataImporter>()
    .AddSingleton<DbWriter>();

using IHost host = builder.Build();

await host.RunAsync();