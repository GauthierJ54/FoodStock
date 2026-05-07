using FoodStore.Application.Auth;
using FoodStore.Application.Foods;
using FoodStore.Domain.Foods;
using Microsoft.EntityFrameworkCore;

namespace FoodStore.Infrastructure.Persistence.Ef;

public sealed class EfFoodWriteRepository : IFoodWriteRepository
{
    private readonly FoodStoreDbContext _dbContext;
    private readonly ICurrentUserService _currentUser;

    public EfFoodWriteRepository(FoodStoreDbContext dbContext, ICurrentUserService currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public async Task<FoodItem?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        var userName = GetCurrentUserName();
        var food = await _dbContext.Foods
            .AsNoTracking()
            .FirstOrDefaultAsync(food => food.Id == id && food.UserName == userName, cancellationToken);

        return food?.ToDomain();
    }

    public async Task AddAsync(FoodItem food, CancellationToken cancellationToken)
    {
        _dbContext.Foods.Add(FoodEntity.FromDomain(food, GetCurrentUserName()));
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(FoodItem food, CancellationToken cancellationToken)
    {
        var userName = GetCurrentUserName();
        var existing = await _dbContext.Foods
            .FirstOrDefaultAsync(existing => existing.Id == food.Id && existing.UserName == userName, cancellationToken);

        if (existing is null)
        {
            return;
        }

        existing.UpdateFromDomain(food);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var userName = GetCurrentUserName();
        var deleted = await _dbContext.Foods
            .Where(food => food.Id == id && food.UserName == userName)
            .ExecuteDeleteAsync(cancellationToken);

        return deleted > 0;
    }

    private string GetCurrentUserName()
    {
        return _currentUser.Username.Trim().ToLowerInvariant();
    }
}
