using core.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

var bld = WebApplication.CreateBuilder();

bld.Services
    .AddFastEndpoints()
    .AddDbContext<NiDataContext>(o =>
    {
        o.UseSqlServer(bld.Configuration.GetConnectionString("DefaultConnection"));
    });

var app = bld.Build();
app.UseFastEndpoints();
app.Run();