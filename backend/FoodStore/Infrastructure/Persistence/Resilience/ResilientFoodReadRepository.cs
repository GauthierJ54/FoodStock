using FoodStore.Application.Foods;
using FoodStore.Domain.Foods;
using FoodStore.Infrastructure.Persistence.Ef;
using FoodStore.Infrastructure.Persistence.Files;

namespace FoodStore.Infrastructure.Persistence.Resilience;

public sealed class ResilientFoodReadRepository : IFoodReadRepository
{
    private readonly EfFoodReadRepository _sqlRepository;
    private readonly FlatFileFoodRepository _flatFileRepository;
    private readonly ILogger<ResilientFoodReadRepository> _logger;

    public ResilientFoodReadRepository(
        EfFoodReadRepository sqlRepository,
        FlatFileFoodRepository flatFileRepository,
        ILogger<ResilientFoodReadRepository> logger)
    {
        _sqlRepository = sqlRepository;
        _flatFileRepository = flatFileRepository;
        _logger = logger;
    }

    public Task<IReadOnlyList<FoodReadModel>> ListAsync(FoodFilter filter, CancellationToken cancellationToken)
    {
        return WithFallbackAsync(
            () => _sqlRepository.ListAsync(filter, cancellationToken),
            () => _flatFileRepository.ListAsync(filter, cancellationToken),
            "liste des aliments");
    }

    public Task<FoodReadModel?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return WithFallbackAsync(
            () => _sqlRepository.GetByIdAsync(id, cancellationToken),
            () => _flatFileRepository.GetByIdAsync(id, cancellationToken),
            "lecture d'un aliment");
    }

    private async Task<T> WithFallbackAsync<T>(
        Func<Task<T>> sqlOperation,
        Func<Task<T>> flatFileOperation,
        string operationName)
    {
        try
        {
            return await sqlOperation();
        }
        catch (Exception exception) when (DatabaseFallback.IsDatabaseUnavailable(exception))
        {
            _logger.LogWarning(exception, "SQL indisponible pendant {OperationName}. Bascule vers le modele de lecture fichier plat.", operationName);

            return await flatFileOperation();
        }
    }
}
