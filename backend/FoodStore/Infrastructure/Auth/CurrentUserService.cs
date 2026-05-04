using System.Security.Claims;
using FoodStore.Application.Auth;

namespace FoodStore.Infrastructure.Auth;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string Username
    {
        get
        {
            var username = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(username))
            {
                throw new InvalidOperationException("Aucun utilisateur authentifie dans le contexte courant.");
            }

            return username;
        }
    }
}
