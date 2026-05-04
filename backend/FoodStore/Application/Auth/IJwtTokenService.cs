using System.Security.Claims;

namespace FoodStore.Application.Auth;

public interface IJwtTokenService
{
    CreatedToken CreateToken(string username);

    ClaimsPrincipal? ValidateToken(string token);
}

public sealed record CreatedToken(string AccessToken, DateTimeOffset ExpiresAt);
