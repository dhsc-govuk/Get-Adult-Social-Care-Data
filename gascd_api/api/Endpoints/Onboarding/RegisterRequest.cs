namespace api.Endpoints.Onboarding;

public class RegisterRequest
{
    public required string RegFullName { get; init; }

    public required string RegLa { get; init; }

    public required string RegMail { get; init; }

    public required string RegOrgName { get; init; }

    public required string RegRole { get; init; }
}
