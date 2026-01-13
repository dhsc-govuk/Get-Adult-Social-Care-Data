using FastEndpoints;
using FluentValidation.Results;

namespace api.Endpoints.PostProcessors;

public class ValidationLogger(ILogger<ValidationLogger> logger) : IGlobalPostProcessor
{
    public Task PostProcessAsync(IPostProcessorContext context, CancellationToken ct)
    {
        if (ValidationContext.Instance.ValidationFailed)
        {
            foreach (ValidationFailure instanceValidationFailure in ValidationContext.Instance.ValidationFailures)
            {
                logger.LogInformation(instanceValidationFailure.ToString());
            }
        }
        return Task.CompletedTask;
    }
}