using FoodStore.Application.Auth;

namespace FoodStore.Api.Auth;

public sealed class JwtAuthenticationMiddleware
{
    private const string BearerPrefix = "Bearer ";
    private readonly RequestDelegate _next;

    public JwtAuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IJwtTokenService tokenService)
    {
        var authorization = context.Request.Headers.Authorization.ToString();

        if (authorization.StartsWith(BearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var token = authorization[BearerPrefix.Length..].Trim();
            var principal = tokenService.ValidateToken(token);

            if (principal is not null)
            {
                context.User = principal;
            }
        }

        await _next(context);
    }
}
