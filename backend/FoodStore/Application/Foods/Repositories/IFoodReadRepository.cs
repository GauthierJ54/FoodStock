using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public interface IFoodReadRepository
{
    Task<IReadOnlyList<FoodReadModel>> ListAsync(FoodFilter filter, CancellationToken cancellationToken);

    Task<FoodReadModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}
