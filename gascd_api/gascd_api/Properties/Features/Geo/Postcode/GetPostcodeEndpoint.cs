using FastEndpoints;

namespace gascd_api.Properties.Features.Geo.Postcode;

    public class GetPostcodeEndpoint : Endpoint<GetPostcodeRequest, GetPostcodeResponse>
    {


        public override void Configure()
        {
            Get("/api/geo/postcode");
            AllowAnonymous();
        }

        public override async Task HandleAsync(GetPostcodeRequest req, CancellationToken ct)
        {
            

            await Send.OkAsync(new GetPostcodeResponse(), ct);
        }
    }
