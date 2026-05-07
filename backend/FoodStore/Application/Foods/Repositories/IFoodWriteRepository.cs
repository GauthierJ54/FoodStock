using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public interface IFoodWriteRepository
{
    Task<FoodItem?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken);

    Task AddAsync(FoodItem food, CancellationToken cancellationToken);

    Task UpdateAsync(FoodItem food, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
