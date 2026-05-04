namespace FoodStore.Api.Auth;

public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public string Username { get; init; } = "admin";

    public string Password { get; init; } = "admin";
}
