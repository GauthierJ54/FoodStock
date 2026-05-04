namespace FoodStore.Domain.Users;

public sealed record UserAccount(
    string Username,
    string PasswordHash,
    DateTimeOffset CreatedAt);
