namespace FoodStore.Api.Auth;

public sealed class JwtEndpointFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        if (context.HttpContext.User.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        return await next(context);
    }
}
