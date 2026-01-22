using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.Data.Shared;

public enum LocationTypeEnum
{
    Regional,
    National,
    LA,
    CareProviderLocation,
}