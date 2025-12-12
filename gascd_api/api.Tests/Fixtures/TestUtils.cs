using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace api.Tests.Fixtures;

public static class TestUtils
{
    public static async Task<T?> ParseJsonResponse<T>(HttpResponseMessage response)
    {
        var rawJson = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        return JsonConvert.DeserializeObject<T>(rawJson);
    }

}