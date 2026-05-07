using FoodStore.Application.Abstractions;
using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public sealed class GetInventorySummaryHandler : IRequestHandler<GetInventorySummaryQuery, InventorySummary>
{
    private const int ExpiringSoonDays = 7;
    private readonly IFoodReadRepository _readRepository;

    public GetInventorySummaryHandler(IFoodReadRepository readRepository)
    {
        _readRepository = readRepository;
    }

    public async Task<InventorySummary> Handle(GetInventorySummaryQuery request, CancellationToken cancellationToken)
    {
        var foods = await _readRepository.ListAsync(FoodFilter.Empty, cancellationToken);
        var today = DateTime.UtcNow;
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
}
