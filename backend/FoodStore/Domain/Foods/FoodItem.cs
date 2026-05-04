namespace FoodStore.Domain.Foods;

public sealed record FoodItem(
    Guid Id,
    string Name,
    string? Category,
    decimal Quantity,
    string Unit,
    DateOnly? ExpirationDate,
    string? Location,
    decimal? MinimumQuantity,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
