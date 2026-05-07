using FoodStore.Application.Auth;
using FoodStore.Application.Foods;
using FoodStore.Domain.Foods;
using Microsoft.EntityFrameworkCore;

namespace FoodStore.Infrastructure.Persistence.Ef;

public sealed class EfFoodReadRepository : IFoodReadRepository
{
    private readonly FoodStoreDbContext _dbContext;
    private readonly ICurrentUserService _currentUser;

    public EfFoodReadRepository(FoodStoreDbContext dbContext, ICurrentUserService currentUser)
    {
        _dbContext = dbContext;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<FoodReadModel>> ListAsync(FoodFilter filter, CancellationToken cancellationToken)
    {
        var query = ApplyFilter(CurrentUserFoods(), filter);

        var foods = await query
            .OrderBy(food => food.ExpirationDate ?? DateTime.MaxValue)
            .ThenBy(food => food.Name)
            .Select(food => new FoodReadModel(
                food.Id,
                food.Name,
                food.Category,
                food.Quantity,
                food.Unit,
                food.ExpirationDate,
                food.Location,
                food.MinimumQuantity,
                food.Notes,
                food.CreatedAt,
                food.UpdatedAt))
            .ToListAsync(cancellationToken);

        return foods;
    }

    public Task<FoodReadModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return CurrentUserFoods()
            .Where(food => food.Id == id)
            .Select(food => new FoodReadModel(
                food.Id,
                food.Name,
                food.Category,
                food.Quantity,
                food.Unit,
                food.ExpirationDate,
                food.Location,
                food.MinimumQuantity,
                food.Notes,
                food.CreatedAt,
                food.UpdatedAt))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private IQueryable<FoodEntity> CurrentUserFoods()
    {
        var userName = _currentUser.Username.Trim().ToLowerInvariant();

        return _dbContext.Foods
            .AsNoTracking()
            .Where(food => food.UserName == userName);
    }

    private static IQueryable<FoodEntity> ApplyFilter(IQueryable<FoodEntity> query, FoodFilter filter)
    {
        var today = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var searchPattern = $"%{filter.Search.Trim()}%";
            query = query.Where(food =>
                EF.Functions.Like(food.Name, searchPattern) ||
                food.Category != null && EF.Functions.Like(food.Category, searchPattern) ||
                food.Location != null && EF.Functions.Like(food.Location, searchPattern) ||
                food.Notes != null && EF.Functions.Like(food.Notes, searchPattern));
        }

        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            query = query.Where(food => food.Category == filter.Category.Trim());
        }

        if (filter.Expired is true)
        {
            query = query.Where(food => food.ExpirationDate != null && food.ExpirationDate < today);
        }
        else if (filter.Expired is false)
        {
            query = query.Where(food => food.ExpirationDate == null || food.ExpirationDate >= today);
        }

        if (filter.LowStock is true)
        {
            query = query.Where(food => food.MinimumQuantity != null && food.Quantity <= food.MinimumQuantity);
        }
        else if (filter.LowStock is false)
        {
            query = query.Where(food => food.MinimumQuantity == null || food.Quantity > food.MinimumQuantity);
        }

        return query;
    }
}
