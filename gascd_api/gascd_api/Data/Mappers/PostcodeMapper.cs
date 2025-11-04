using gascd_api.Data.Models;
using gascd_api.Features.Geo.Postcode;
using Riok.Mapperly.Abstractions;

namespace gascd_api.Data.Mappers;

[Mapper]
public partial class PostcodeMapper
{
    [MapperIgnoreTarget(nameof(GetPostcodeResponse.LaName))]
    public partial GetPostcodeResponse PostCodeDatumToGetPostcodeResponse(PostcodeDatum postcode);
}