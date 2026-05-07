namespace FoodStore.Api.Auth;

public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public string Username { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;
}
