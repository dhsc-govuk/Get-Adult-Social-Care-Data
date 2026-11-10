using api.Data.Shared;
using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class GetCqcLocationRatingsValidator : Validator<GetCqcLocationRatingsRequest>
{
    private const string ServiceTypeCodePrefix = "cqci_num_total_";

    // The service types are the suffixes of the CQC metric codes, so the list filters the same way as the charts.
    public static readonly string[] ServiceTypes = Enum.GetNames<MetricCodeEnum>()
        .Where(name => name.StartsWith(ServiceTypeCodePrefix))
        .Select(name => name[ServiceTypeCodePrefix.Length..])
        .ToArray();

    public GetCqcLocationRatingsValidator()
    {
        RuleFor(x => x.LocalAuthorityCode)
            .NotEmpty().WithMessage("Local Authority code is required")
            .MinimumLength(3).WithMessage("Local Authority code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Local Authority code has a maximum length of 15");

        RuleFor(x => x.ServiceType)
            .Must(s => s is null || ServiceTypes.Contains(s))
            .WithMessage($"Service type must be one of: {string.Join(", ", ServiceTypes)}");
    }
}