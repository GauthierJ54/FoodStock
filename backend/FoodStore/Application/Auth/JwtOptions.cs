namespace FoodStore.Application.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "FoodStore";

    public string Audience { get; init; } = "FoodStore";

    public string Secret { get; init; } = "change-me-with-a-long-local-secret";

    public int ExpirationMinutes { get; init; } = 120;
}
