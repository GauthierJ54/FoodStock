using System.Text.Json;
using FoodStore.Api.Auth;
using FoodStore.Application.Auth;
using FoodStore.Domain.Users;
using Microsoft.Extensions.Options;

namespace FoodStore.Infrastructure.Files;

public sealed class FlatFileUserRepository : IUserRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private readonly SemaphoreSlim _fileLock = new(1, 1);
    private readonly string _usersPath;
    private readonly AuthOptions _authOptions;
    private readonly IPasswordHasher _passwordHasher;

    public FlatFileUserRepository(
        IOptions<FlatFileOptions> fileOptions,
        IOptions<AuthOptions> authOptions,
        IPasswordHasher passwordHasher,
        IHostEnvironment environment)
    {
        var configuredPath = string.IsNullOrWhiteSpace(fileOptions.Value.UsersPath)
            ? "App_Data/users.json"
            : fileOptions.Value.UsersPath;

        _usersPath = Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.Combine(environment.ContentRootPath, configuredPath);
        _authOptions = authOptions.Value;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserAccount?> GetByUsernameAsync(string username, CancellationToken cancellationToken)
    {
        await _fileLock.WaitAsync(cancellationToken);

        try
        {
            var users = await ReadAllUnsafeAsync(cancellationToken);

            return users.FirstOrDefault(user => string.Equals(user.Username, username, StringComparison.OrdinalIgnoreCase));
        }
        finally
        {
            _fileLock.Release();
        }
    }

    public async Task AddAsync(UserAccount user, CancellationToken cancellationToken)
    {
        await _fileLock.WaitAsync(cancellationToken);

        try
        {
            var users = await ReadAllUnsafeAsync(cancellationToken);

            if (users.Any(existing => string.Equals(existing.Username, user.Username, StringComparison.OrdinalIgnoreCase)))
            {
                return;
            }

            users.Add(user);
            await WriteAllUnsafeAsync(users, cancellationToken);
        }
        finally
        {
            _fileLock.Release();
        }
    }

    private async Task<List<UserAccount>> ReadAllUnsafeAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(_usersPath))
        {
            var defaultUser = CreateDefaultUser();
            await WriteAllUnsafeAsync([defaultUser], cancellationToken);

            return [defaultUser];
        }

        await using var stream = File.OpenRead(_usersPath);

        return await JsonSerializer.DeserializeAsync<List<UserAccount>>(stream, JsonOptions, cancellationToken) ?? [];
    }

    private async Task WriteAllUnsafeAsync(List<UserAccount> users, CancellationToken cancellationToken)
    {
        var directory = Path.GetDirectoryName(_usersPath);

        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var tempPath = $"{_usersPath}.tmp";

        await using (var stream = File.Create(tempPath))
        {
            await JsonSerializer.SerializeAsync(stream, users, JsonOptions, cancellationToken);
        }

        File.Move(tempPath, _usersPath, overwrite: true);
    }

    private UserAccount CreateDefaultUser()
    {
        var username = string.IsNullOrWhiteSpace(_authOptions.Username)
            ? "admin"
            : _authOptions.Username.Trim().ToLowerInvariant();
        var password = string.IsNullOrWhiteSpace(_authOptions.Password)
            ? "adminadmin"
            : _authOptions.Password;

        return new UserAccount(username, _passwordHasher.Hash(password), DateTimeOffset.UtcNow);
    }
}
