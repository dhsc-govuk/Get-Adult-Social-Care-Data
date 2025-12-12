using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace api.Tests.Fixtures;

public static class TestUtils
{
    public static async Task<T?> ParseJsonResponse<T>(HttpResponseMessage response)
    {
        string rawJson = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        return JsonConvert.DeserializeObject<T>(rawJson);
    }

    public static string? GetFromJson(JToken? json, string key)
    {
        return json?.SelectToken(key)?.Value<string>();
    }
}