using FoodStore.Api.Auth;
using FoodStore.Application.Auth;

namespace FoodStore.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (RegisterRequest request, IAuthService authService, CancellationToken cancellationToken) =>
        {
            var result = await authService.RegisterAsync(request, cancellationToken);

            if (!result.Succeeded)
            {
                return result.ToHttpResult();
            }

            return Results.Created($"/api/users/{result.Value!.Username}", result.Value);
        });

        group.MapPost("/login", async (LoginRequest request, IAuthService authService, CancellationToken cancellationToken) =>
        {
            var result = await authService.LoginAsync(request, cancellationToken);

            return result.ToHttpResult();
        });

        return app;
    }
}
