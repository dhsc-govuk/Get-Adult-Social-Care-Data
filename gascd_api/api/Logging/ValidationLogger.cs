using FastEndpoints;
using FluentValidation.Results;

namespace api.Logging;

public class ValidationLogger(ILogger<ValidationLogger> logger) : IGlobalPostProcessor
{
    public Task PostProcessAsync(IPostProcessorContext context, CancellationToken ct)
    {
        if (ValidationContext.Instance.ValidationFailed)
        {
            logger.LogWarning(GetValidationErrorString(ValidationContext.Instance.ValidationFailures));
        }
        return Task.CompletedTask;
    }

    private string GetValidationErrorString(List<ValidationFailure> validationFailures)
    {
        return String.Join(", ", validationFailures.Select(f => $"[{f.PropertyName}] - [{f.ErrorMessage}]").ToArray());
    }
}