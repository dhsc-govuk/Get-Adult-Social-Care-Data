using FastEndpoints;
using FluentValidation;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class GetCqcLocationRatingsValidator : Validator<GetCqcLocationRatingsRequest>
{
    // The service type suffixes of the cqc_ratings / cqc_inspection_status metric codes.
    public static readonly string[] ServiceTypes =
    [
        "adult_social_care",
        "care_home",
        "care_home_nursing",
        "care_home_residential",
        "community_care",
        "domiciliary_care",
        "supported_living",
        "extra_care_housing",
        "other_community_care",
    ];

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