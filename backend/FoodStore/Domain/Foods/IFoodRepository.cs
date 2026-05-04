namespace FoodStore.Domain.Foods;

public interface IFoodRepository
{
    Task<IReadOnlyList<FoodItem>> ListAsync(FoodFilter filter, CancellationToken cancellationToken);

    Task<FoodItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task AddAsync(FoodItem food, CancellationToken cancellationToken);

    Task UpdateAsync(FoodItem food, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
