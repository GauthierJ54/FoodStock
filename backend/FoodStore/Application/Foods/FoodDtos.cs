namespace FoodStore.Application.Foods;

public sealed record CreateFoodRequest(
    string Name,
    string? Category,
    decimal Quantity,
    string Unit,
    DateTime? ExpirationDate,
    string? Location,
    decimal? MinimumQuantity,
    string? Notes);

public sealed record UpdateFoodRequest(
    string Name,
    string? Category,
    decimal Quantity,
    string Unit,
    DateTime? ExpirationDate,
    string? Location,
    decimal? MinimumQuantity,
    string? Notes);

public sealed record SetFoodQuantityRequest(decimal Quantity);

public sealed record InventorySummary(
    int TotalItems,
    int ExpiredItems,
    int ExpiringSoonItems,
    int LowStockItems,
    IReadOnlyDictionary<string, int> ItemsByCategory);
