using api.Configuration;
using api.Endpoints.Metrics.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net;

namespace api.Tests;

public class RateLimitingTests
{
    private static WebApplication BuildApp(int permits = 2)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseTestServer();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["RateLimiting:ConcurrencyLimit"] = permits.ToString()
        });
        builder.Services.RegisterRateLimiting(builder.Configuration);
        var app = builder.Build();
        app.UseRouting();
        app.UseRateLimiter();
        app.MapGet("/health", () => "healthy");
        return app;
    }

    [Fact]
    public async Task SaturationRejectsWithoutQueueingAndKeepsHealthAvailable()
    {
        await using var app = BuildApp();
        using var entered = new SemaphoreSlim(0);
        var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        app.MapGet("/api/hold", async (HttpContext context) =>
        {
            entered.Release();
            await release.Task.WaitAsync(context.RequestAborted);
            return "done";
        });
        await app.StartAsync();
        using var client = app.GetTestClient();
        var first = client.GetAsync("/api/hold");
        var second = client.GetAsync("/api/hold");
        try
        {
            Assert.True(await entered.WaitAsync(TimeSpan.FromSeconds(5)));
            Assert.True(await entered.WaitAsync(TimeSpan.FromSeconds(5)));
            var denied = await client.GetAsync("/api/hold");
            Assert.Equal(HttpStatusCode.TooManyRequests, denied.StatusCode);
            Assert.Null(denied.Headers.RetryAfter);
            Assert.Contains("RATE_LIMITED", await denied.Content.ReadAsStringAsync());
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health")).StatusCode);
        }
        finally { release.TrySetResult(); }
        Assert.All(await Task.WhenAll(first, second), response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/hold")).StatusCode);
    }

    [Fact]
    public async Task ExceptionReleasesPermit()
    {
        await using var app = BuildApp(1);
        app.MapGet("/api/fail", (HttpContext _) => Task.FromException(new InvalidOperationException("test")));
        app.MapGet("/api/ok", () => "ok");
        await app.StartAsync();
        using var client = app.GetTestClient();
        await Assert.ThrowsAsync<InvalidOperationException>(() => client.GetAsync("/api/fail"));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/ok")).StatusCode);
    }

    [Fact]
    public async Task CancellationReleasesPermit()
    {
        await using var app = BuildApp(1);
        var entered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var exited = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        app.MapGet("/api/wait", async (HttpContext context) =>
        {
            entered.SetResult();
            try { await Task.Delay(Timeout.Infinite, context.RequestAborted); }
            finally { exited.SetResult(); }
        });
        app.MapGet("/api/ok", () => "ok");
        await app.StartAsync();
        using var client = app.GetTestClient();
        using var cancellation = new CancellationTokenSource();
        var pending = client.GetAsync("/api/wait", cancellation.Token);
        await entered.Task.WaitAsync(TimeSpan.FromSeconds(5));
        cancellation.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => pending);
        await exited.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/ok")).StatusCode);
    }

    [Fact]
    public void RejectsInvalidConfiguration()
    {
        Assert.Throws<InvalidOperationException>(() => BuildApp(0));
    }

    [Fact]
    public void RejectsOversizedLocationLists()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["RateLimiting:MaxLocations"] = "2"
        }).Build();
        var validator = new GetMetricValidator(config);
        var location = new GetMetricRequest.Location { LocationCode = "E06000001", LocationType = api.Data.Shared.LocationTypeEnum.LA };
        var result = validator.Validate(new GetMetricRequest { MetricCode = default, Locations = [location, location, location] });
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == "Locations");
    }
}
