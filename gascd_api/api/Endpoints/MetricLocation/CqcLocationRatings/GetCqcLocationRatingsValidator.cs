using api.Data.Shared;
using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class GetCqcLocationRatingsValidator : Validator<GetCqcLocationRatingsRequest>
{
    public const int MaxPageSize = 100;

    private const string ServiceTypeCodePrefix = "cqci_num_total_";
    private const string RatingCodePrefix = "cqcr_num_";
    private const string RatingCodeSuffix = "_adult_social_care";

    // The service types are the suffixes of the CQC metric codes, so the list filters the same way as the charts.
    public static readonly string[] ServiceTypes = Enum.GetNames<MetricCodeEnum>()
        .Where(name => name.StartsWith(ServiceTypeCodePrefix))
        .Select(name => name[ServiceTypeCodePrefix.Length..])
        .ToArray();

    // The ratings are taken from the CQC metric codes in the same way.
    public static readonly string[] Ratings = Enum.GetNames<MetricCodeEnum>()
        .Where(name => name.StartsWith(RatingCodePrefix) && name.EndsWith(RatingCodeSuffix))
        .Select(name => name[RatingCodePrefix.Length..^RatingCodeSuffix.Length])
        .ToArray();

    public GetCqcLocationRatingsValidator()
    {
        RuleForEach(x => x.LaCodes)
            .NotEmpty().WithMessage("Local Authority code is required")
            .MinimumLength(3).WithMessage("Local Authority code has a minimum length of 3")
            .MaximumLength(15).WithMessage("Local Authority code has a maximum length of 15");

        RuleForEach(x => x.ProviderCodes)
            .NotEmpty().WithMessage("Provider code is required")
            .MaximumLength(15).WithMessage("Provider code has a maximum length of 15");

        RuleForEach(x => x.ServiceTypes)
            .Must(s => ServiceTypes.Contains(s))
            .WithMessage($"Service type must be one of: {string.Join(", ", ServiceTypes)}");

        RuleForEach(x => x.Ratings)
            .Must(r => Ratings.Contains(r))
            .WithMessage($"Rating must be one of: {string.Join(", ", Ratings)}");

        RuleFor(x => x.Search)
            .MaximumLength(255).WithMessage("Search has a maximum length of 255");

        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1).WithMessage("Page must be 1 or more");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, MaxPageSize).WithMessage($"Page size must be between 1 and {MaxPageSize}");
    }
}