using api.Data.Models;
using api.Endpoints.Geo.Postcode;
using Riok.Mapperly.Abstractions;

namespace api.Data.Mappers;

[Mapper]
public partial class PostcodeMapper
{
    [MapperIgnoreTarget(nameof(GetPostcodeResponse.LaName))]
    public partial GetPostcodeResponse PostCodeDatumToGetPostcodeResponse(PostcodeDatum postcode);
}