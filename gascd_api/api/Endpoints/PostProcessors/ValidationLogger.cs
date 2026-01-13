using FastEndpoints;
using FluentValidation.Results;

namespace api.Endpoints.PostProcessors;

public class ValidationLogger(ILogger<ValidationLogger> logger) : IGlobalPostProcessor
{
    public Task PostProcessAsync(IPostProcessorContext context, CancellationToken ct)
    {
        if (ValidationContext.Instance.ValidationFailed)
        {
            foreach (ValidationFailure failure in ValidationContext.Instance.ValidationFailures)
            {
                logger.LogWarning(failure.ToString());
            }
        }
        return Task.CompletedTask;
    }
}