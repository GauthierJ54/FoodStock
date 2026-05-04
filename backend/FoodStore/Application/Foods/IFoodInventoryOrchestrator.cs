using FoodStore.Application.Abstractions;
using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public interface IFoodInventoryOrchestrator
{
    Task<IReadOnlyList<FoodItem>> GetFoodsAsync(FoodFilter filter, CancellationToken cancellationToken);

    Task<ApiResult<FoodItem>> GetFoodAsync(Guid id, CancellationToken cancellationToken);

    Task<ApiResult<FoodItem>> CreateFoodAsync(CreateFoodRequest request, CancellationToken cancellationToken);

    Task<ApiResult<FoodItem>> UpdateFoodAsync(Guid id, UpdateFoodRequest request, CancellationToken cancellationToken);

    Task<ApiResult<FoodItem>> SetQuantityAsync(Guid id, SetFoodQuantityRequest request, CancellationToken cancellationToken);

    Task<ApiResult> DeleteFoodAsync(Guid id, CancellationToken cancellationToken);

    Task<InventorySummary> GetSummaryAsync(CancellationToken cancellationToken);
}
