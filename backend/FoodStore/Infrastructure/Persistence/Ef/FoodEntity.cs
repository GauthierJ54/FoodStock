using FoodStore.Domain.Foods;

namespace FoodStore.Infrastructure.Persistence.Ef;

public sealed class FoodEntity
{
    public Guid Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Category { get; set; }

    public decimal Quantity { get; set; }

    public string Unit { get; set; } = string.Empty;

    public DateTime? ExpirationDate { get; set; }

    public string? Location { get; set; }

    public decimal? MinimumQuantity { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public FoodItem ToDomain()
    {
        return new FoodItem(
            Id,
            Name,
            Category,
            Quantity,
            Unit,
            ExpirationDate,
            Location,
            MinimumQuantity,
            Notes,
            CreatedAt,
            UpdatedAt);
    }

    public static FoodEntity FromDomain(FoodItem food, string userName)
    {
        return new FoodEntity
        {
            Id = food.Id,
            UserName = userName,
            Name = food.Name,
            Category = food.Category,
            Quantity = food.Quantity,
            Unit = food.Unit,
            ExpirationDate = food.ExpirationDate,
            Location = food.Location,
            MinimumQuantity = food.MinimumQuantity,
            Notes = food.Notes,
            CreatedAt = food.CreatedAt,
            UpdatedAt = food.UpdatedAt
        };
    }

    public void UpdateFromDomain(FoodItem food)
    {
        Name = food.Name;
        Category = food.Category;
        Quantity = food.Quantity;
        Unit = food.Unit;
        ExpirationDate = food.ExpirationDate;
        Location = food.Location;
        MinimumQuantity = food.MinimumQuantity;
        Notes = food.Notes;
        UpdatedAt = food.UpdatedAt;
    }
}
