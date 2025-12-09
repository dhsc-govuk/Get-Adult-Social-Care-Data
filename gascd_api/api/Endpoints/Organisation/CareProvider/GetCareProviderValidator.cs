using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderValidator : Validator<GetCareProviderRequest>
{
    public GetCareProviderValidator()
    {
        RuleFor(x => x.CareProviderId)
            .NotEmpty();
    }
}