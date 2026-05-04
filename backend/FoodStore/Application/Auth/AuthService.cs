using FoodStore.Application.Abstractions;
using FoodStore.Domain.Users;

namespace FoodStore.Application.Auth;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _tokenService;

    public AuthService(IUserRepository users, IPasswordHasher passwordHasher, IJwtTokenService tokenService)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<ApiResult<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var validationError = ValidateCredentials(request.Username, request.Password);

        if (validationError is not null)
        {
            return ApiResult<AuthResponse>.BadRequest(validationError);
        }

        var username = NormalizeUsername(request.Username);
        var existing = await _users.GetByUsernameAsync(username, cancellationToken);

        if (existing is not null)
        {
            return ApiResult<AuthResponse>.BadRequest("Cet utilisateur existe deja.");
        }

        var user = new UserAccount(
            username,
            _passwordHasher.Hash(request.Password),
            DateTimeOffset.UtcNow);

        await _users.AddAsync(user, cancellationToken);

        return ApiResult<AuthResponse>.Success(CreateResponse(user.Username));
    }

    public async Task<ApiResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var username = NormalizeUsername(request.Username);
        var user = await _users.GetByUsernameAsync(username, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return ApiResult<AuthResponse>.Failure("Identifiants invalides.", StatusCodes.Status401Unauthorized);
        }

        return ApiResult<AuthResponse>.Success(CreateResponse(user.Username));
    }

    private AuthResponse CreateResponse(string username)
    {
        var token = _tokenService.CreateToken(username);

        return new AuthResponse(username, token.AccessToken, "Bearer", token.ExpiresAt);
    }

    private static string? ValidateCredentials(string username, string password)
    {
        var normalizedUsername = NormalizeUsername(username);

        if (normalizedUsername.Length is < 3 or > 64)
        {
            return "Le nom d'utilisateur doit contenir entre 3 et 64 caracteres.";
        }

        if (normalizedUsername.Any(character => !char.IsLetterOrDigit(character) && character is not '-' and not '_' and not '.'))
        {
            return "Le nom d'utilisateur accepte uniquement lettres, chiffres, tiret, underscore et point.";
        }

        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        {
            return "Le mot de passe doit contenir au moins 8 caracteres.";
        }

        return null;
    }

    private static string NormalizeUsername(string username)
    {
        return username.Trim().ToLowerInvariant();
    }
}
