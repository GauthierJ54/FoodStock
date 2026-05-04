using FoodStore.Application.Abstractions;
using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public sealed class FoodInventoryOrchestrator : IFoodInventoryOrchestrator
{
    private const int ExpiringSoonDays = 7;
    private readonly IFoodRepository _repository;

    public FoodInventoryOrchestrator(IFoodRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<FoodItem>> GetFoodsAsync(FoodFilter filter, CancellationToken cancellationToken)
    {
        return _repository.ListAsync(filter, cancellationToken);
    }

    public async Task<ApiResult<FoodItem>> GetFoodAsync(Guid id, CancellationToken cancellationToken)
    {
        var food = await _repository.GetByIdAsync(id, cancellationToken);

        return food is null
            ? ApiResult<FoodItem>.NotFound("Aliment introuvable.")
            : ApiResult<FoodItem>.Success(food);
    }

    public async Task<ApiResult<FoodItem>> CreateFoodAsync(CreateFoodRequest request, CancellationToken cancellationToken)
    {
        var validationError = Validate(request.Name, request.Quantity, request.Unit, request.MinimumQuantity);

        if (validationError is not null)
        {
            return ApiResult<FoodItem>.BadRequest(validationError);
        }

        var now = DateTimeOffset.UtcNow;
        var food = new FoodItem(
            Guid.NewGuid(),
            Clean(request.Name)!,
            Clean(request.Category),
            request.Quantity,
            Clean(request.Unit)!,
            request.ExpirationDate,
            Clean(request.Location),
            request.MinimumQuantity,
            Clean(request.Notes),
            now,
            now);

        await _repository.AddAsync(food, cancellationToken);

        return ApiResult<FoodItem>.Success(food);
    }

    public async Task<ApiResult<FoodItem>> UpdateFoodAsync(Guid id, UpdateFoodRequest request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);

        if (existing is null)
        {
            return ApiResult<FoodItem>.NotFound("Aliment introuvable.");
        }

        var validationError = Validate(request.Name, request.Quantity, request.Unit, request.MinimumQuantity);

        if (validationError is not null)
        {
            return ApiResult<FoodItem>.BadRequest(validationError);
        }

        var updated = existing with
        {
            Name = Clean(request.Name)!,
            Category = Clean(request.Category),
            Quantity = request.Quantity,
            Unit = Clean(request.Unit)!,
            ExpirationDate = request.ExpirationDate,
            Location = Clean(request.Location),
            MinimumQuantity = request.MinimumQuantity,
            Notes = Clean(request.Notes),
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _repository.UpdateAsync(updated, cancellationToken);

        return ApiResult<FoodItem>.Success(updated);
    }

    public async Task<ApiResult<FoodItem>> SetQuantityAsync(Guid id, SetFoodQuantityRequest request, CancellationToken cancellationToken)
    {
        if (request.Quantity < 0)
        {
            return ApiResult<FoodItem>.BadRequest("La quantite ne peut pas etre negative.");
        }

        var existing = await _repository.GetByIdAsync(id, cancellationToken);

        if (existing is null)
        {
            return ApiResult<FoodItem>.NotFound("Aliment introuvable.");
        }

        var updated = existing with
        {
            Quantity = request.Quantity,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _repository.UpdateAsync(updated, cancellationToken);

        return ApiResult<FoodItem>.Success(updated);
    }

    public async Task<ApiResult> DeleteFoodAsync(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _repository.DeleteAsync(id, cancellationToken);

        return deleted
            ? ApiResult.Success()
            : ApiResult.NotFound("Aliment introuvable.");
    }

    public async Task<InventorySummary> GetSummaryAsync(CancellationToken cancellationToken)
    {
        var foods = await _repository.ListAsync(FoodFilter.Empty, cancellationToken);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var soon = today.AddDays(ExpiringSoonDays);

        var byCategory = foods
            .GroupBy(food => string.IsNullOrWhiteSpace(food.Category) ? "Sans categorie" : food.Category)
            .OrderBy(group => group.Key)
            .ToDictionary(group => group.Key, group => group.Count(), StringComparer.OrdinalIgnoreCase);

        return new InventorySummary(
            foods.Count,
            foods.Count(food => food.ExpirationDate is not null && food.ExpirationDate < today),
            foods.Count(food => food.ExpirationDate is not null && food.ExpirationDate >= today && food.ExpirationDate <= soon),
            foods.Count(food => food.MinimumQuantity is not null && food.Quantity <= food.MinimumQuantity),
            byCategory);
    }

    private static string? Validate(string name, decimal quantity, string unit, decimal? minimumQuantity)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Le nom est obligatoire.";
        }

        if (name.Length > 120)
        {
            return "Le nom ne peut pas depasser 120 caracteres.";
        }

        if (quantity < 0)
        {
            return "La quantite ne peut pas etre negative.";
        }

        if (string.IsNullOrWhiteSpace(unit))
        {
            return "L'unite est obligatoire.";
        }

        if (unit.Length > 24)
        {
            return "L'unite ne peut pas depasser 24 caracteres.";
        }

        if (minimumQuantity < 0)
        {
            return "La quantite minimale ne peut pas etre negative.";
        }

        return null;
    }

    private static string? Clean(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
