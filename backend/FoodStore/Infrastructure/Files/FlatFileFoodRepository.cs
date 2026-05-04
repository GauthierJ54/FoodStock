using System.Text.Json;
using FoodStore.Application.Auth;
using FoodStore.Domain.Foods;
using Microsoft.Extensions.Options;

namespace FoodStore.Infrastructure.Files;

public sealed class FlatFileFoodRepository : IFoodRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private readonly SemaphoreSlim _fileLock = new(1, 1);
    private readonly string _foodsDirectory;
    private readonly string _legacyDataPath;
    private readonly ICurrentUserService _currentUser;

    public FlatFileFoodRepository(IOptions<FlatFileOptions> options, IHostEnvironment environment, ICurrentUserService currentUser)
    {
        var legacyPath = string.IsNullOrWhiteSpace(options.Value.DataPath)
            ? "App_Data/foods.json"
            : options.Value.DataPath;
        var foodsDirectory = string.IsNullOrWhiteSpace(options.Value.FoodsDirectory)
            ? "App_Data/foods"
            : options.Value.FoodsDirectory;

        _legacyDataPath = Path.IsPathRooted(legacyPath)
            ? legacyPath
            : Path.Combine(environment.ContentRootPath, legacyPath);
        _foodsDirectory = Path.IsPathRooted(foodsDirectory)
            ? foodsDirectory
            : Path.Combine(environment.ContentRootPath, foodsDirectory);
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<FoodItem>> ListAsync(FoodFilter filter, CancellationToken cancellationToken)
    {
        await _fileLock.WaitAsync(cancellationToken);

        try
        {
            var dataPath = GetCurrentUserDataPath();
            var foods = await ReadAllUnsafeAsync(dataPath, cancellationToken);
            var query = foods.AsEnumerable();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(food =>
                    Contains(food.Name, filter.Search) ||
                    Contains(food.Category, filter.Search) ||
                    Contains(food.Location, filter.Search) ||
                    Contains(food.Notes, filter.Search));
            }

            if (!string.IsNullOrWhiteSpace(filter.Category))
            {
                query = query.Where(food => string.Equals(food.Category, filter.Category, StringComparison.OrdinalIgnoreCase));
            }

            if (filter.Expired is true)
            {
                query = query.Where(food => food.ExpirationDate is not null && food.ExpirationDate < today);
            }
            else if (filter.Expired is false)
            {
                query = query.Where(food => food.ExpirationDate is null || food.ExpirationDate >= today);
            }

            if (filter.LowStock is true)
            {
                query = query.Where(food => food.MinimumQuantity is not null && food.Quantity <= food.MinimumQuantity);
            }
            else if (filter.LowStock is false)
            {
                query = query.Where(food => food.MinimumQuantity is null || food.Quantity > food.MinimumQuantity);
            }

            return query
                .OrderBy(food => food.ExpirationDate ?? DateOnly.MaxValue)
                .ThenBy(food => food.Name)
                .ToArray();
        }
        finally
        {
            _fileLock.Release();
        }
    }

    public async Task<FoodItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        await _fileLock.WaitAsync(cancellationToken);

        try
        {
            var dataPath = GetCurrentUserDataPath();
            var foods = await ReadAllUnsafeAsync(dataPath, cancellationToken);

            return foods.FirstOrDefault(food => food.Id == id);
        }
        finally
        {
            _fileLock.Release();
        }
    }

    public async Task AddAsync(FoodItem food, CancellationToken cancellationToken)
    {
        await _fileLock.WaitAsync(cancellationToken);

        try
        {
            var dataPath = GetCurrentUserDataPath();
            var foods = await ReadAllUnsafeAsync(dataPath, cancellationToken);
            foods.Add(food);
            await WriteAllUnsafeAsync(dataPath, foods, cancellationToken);
        }
        finally
        {
            _fileLock.Release();
        }
    }

    public async Task UpdateAsync(FoodItem food, CancellationToken cancellationToken)
    {
        await _fileLock.WaitAsync(cancellationToken);

        try
        {
            var dataPath = GetCurrentUserDataPath();
            var foods = await ReadAllUnsafeAsync(dataPath, cancellationToken);
            var index = foods.FindIndex(existing => existing.Id == food.Id);

            if (index >= 0)
            {
                foods[index] = food;
                await WriteAllUnsafeAsync(dataPath, foods, cancellationToken);
            }
        }
        finally
        {
            _fileLock.Release();
        }
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await _fileLock.WaitAsync(cancellationToken);

        try
        {
            var dataPath = GetCurrentUserDataPath();
            var foods = await ReadAllUnsafeAsync(dataPath, cancellationToken);
            var deleted = foods.RemoveAll(food => food.Id == id) > 0;

            if (deleted)
            {
                await WriteAllUnsafeAsync(dataPath, foods, cancellationToken);
            }

            return deleted;
        }
        finally
        {
            _fileLock.Release();
        }
    }

    private async Task<List<FoodItem>> ReadAllUnsafeAsync(string dataPath, CancellationToken cancellationToken)
    {
        if (!File.Exists(dataPath))
        {
            if (ShouldMigrateLegacyData(dataPath))
            {
                var migratedFoods = await ReadLegacyUnsafeAsync(cancellationToken);
                await WriteAllUnsafeAsync(dataPath, migratedFoods, cancellationToken);

                return migratedFoods;
            }

            return [];
        }

        await using var stream = File.OpenRead(dataPath);

        return await JsonSerializer.DeserializeAsync<List<FoodItem>>(stream, JsonOptions, cancellationToken) ?? [];
    }

    private async Task<List<FoodItem>> ReadLegacyUnsafeAsync(CancellationToken cancellationToken)
    {
        await using var stream = File.OpenRead(_legacyDataPath);

        return await JsonSerializer.DeserializeAsync<List<FoodItem>>(stream, JsonOptions, cancellationToken) ?? [];
    }

    private async Task WriteAllUnsafeAsync(string dataPath, List<FoodItem> foods, CancellationToken cancellationToken)
    {
        var directory = Path.GetDirectoryName(dataPath);

        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var tempPath = $"{dataPath}.tmp";

        await using (var stream = File.Create(tempPath))
        {
            await JsonSerializer.SerializeAsync(stream, foods, JsonOptions, cancellationToken);
        }

        File.Move(tempPath, dataPath, overwrite: true);
    }

    private static bool Contains(string? value, string search)
    {
        return value?.Contains(search, StringComparison.OrdinalIgnoreCase) == true;
    }

    private string GetCurrentUserDataPath()
    {
        return Path.Combine(_foodsDirectory, $"{ToFileName(_currentUser.Username)}.json");
    }

    private bool ShouldMigrateLegacyData(string userDataPath)
    {
        return string.Equals(_currentUser.Username, "admin", StringComparison.OrdinalIgnoreCase) &&
            !File.Exists(userDataPath) &&
            File.Exists(_legacyDataPath);
    }

    private static string ToFileName(string username)
    {
        var characters = username
            .Trim()
            .ToLowerInvariant()
            .Select(character => char.IsLetterOrDigit(character) || character is '-' or '_' or '.'
                ? character
                : '_')
            .ToArray();

        return new string(characters);
    }
}
