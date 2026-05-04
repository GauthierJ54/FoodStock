namespace FoodStore.Application.Auth;

public sealed record RegisterRequest(string Username, string Password);

public sealed record LoginRequest(string Username, string Password);

public sealed record AuthResponse(string Username, string AccessToken, string TokenType, DateTimeOffset ExpiresAt);
