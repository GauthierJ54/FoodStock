using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public sealed record FoodReadModel(
    Guid Id,
    string Name,
    string? Category,
    decimal Quantity,
    string Unit,
    DateTime? ExpirationDate,
    string? Location,
    decimal? MinimumQuantity,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static FoodReadModel FromDomain(FoodItem food)
    {
        return new FoodReadModel(
            food.Id,
            food.Name,
            food.Category,
            food.Quantity,
            food.Unit,
            food.ExpirationDate,
            food.Location,
            food.MinimumQuantity,
            food.Notes,
            food.CreatedAt,
            food.UpdatedAt);
    }
}
