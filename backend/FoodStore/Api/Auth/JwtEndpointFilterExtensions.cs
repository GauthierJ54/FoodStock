namespace FoodStore.Api.Auth;

public static class JwtEndpointFilterExtensions
{
    public static RouteGroupBuilder RequireJwt(this RouteGroupBuilder group)
    {
        group.AddEndpointFilter<JwtEndpointFilter>();
        return group;
    }
}
