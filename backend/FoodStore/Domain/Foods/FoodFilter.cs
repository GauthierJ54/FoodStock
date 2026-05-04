namespace FoodStore.Domain.Foods;

public sealed record FoodFilter(
    string? Search,
    string? Category,
    bool? Expired,
    bool? LowStock)
{
    public static FoodFilter Empty { get; } = new(null, null, null, null);
}
