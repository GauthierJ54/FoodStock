using FoodStore.Application.Foods;
using FoodStore.Domain.Foods;
using FoodStore.Infrastructure.Persistence.Ef;
using FoodStore.Infrastructure.Persistence.Files;

namespace FoodStore.Infrastructure.Persistence.Resilience;

public sealed class ResilientFoodWriteRepository : IFoodWriteRepository
{
    private readonly EfFoodWriteRepository _sqlRepository;
    private readonly FlatFileFoodRepository _flatFileRepository;
    private readonly ILogger<ResilientFoodWriteRepository> _logger;

    public ResilientFoodWriteRepository(
        EfFoodWriteRepository sqlRepository,
        FlatFileFoodRepository flatFileRepository,
        ILogger<ResilientFoodWriteRepository> logger)
    {
        _sqlRepository = sqlRepository;
        _flatFileRepository = flatFileRepository;
        _logger = logger;
    }

    public Task<FoodItem?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return WithFallbackAsync(
            () => _sqlRepository.GetByIdForUpdateAsync(id, cancellationToken),
            () => _flatFileRepository.GetByIdForUpdateAsync(id, cancellationToken),
            "lecture d'un aliment pour modification");
    }

    public Task AddAsync(FoodItem food, CancellationToken cancellationToken)
    {
        return WithFallbackAsync(
            () => _sqlRepository.AddAsync(food, cancellationToken),
            () => _flatFileRepository.AddAsync(food, cancellationToken),
            "creation d'un aliment");
    }

    public Task UpdateAsync(FoodItem food, CancellationToken cancellationToken)
    {
        return WithFallbackAsync(
            () => _sqlRepository.UpdateAsync(food, cancellationToken),
            () => _flatFileRepository.UpdateAsync(food, cancellationToken),
            "mise a jour d'un aliment");
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        return WithFallbackAsync(
            () => _sqlRepository.DeleteAsync(id, cancellationToken),
            () => _flatFileRepository.DeleteAsync(id, cancellationToken),
            "suppression d'un aliment");
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
            _logger.LogWarning(exception, "SQL indisponible pendant {OperationName}. Bascule vers le modele d'ecriture fichier plat.", operationName);

            return await flatFileOperation();
        }
    }

    private async Task WithFallbackAsync(
        Func<Task> sqlOperation,
        Func<Task> flatFileOperation,
        string operationName)
    {
        try
        {
            await sqlOperation();
        }
        catch (Exception exception) when (DatabaseFallback.IsDatabaseUnavailable(exception))
        {
            _logger.LogWarning(exception, "SQL indisponible pendant {OperationName}. Bascule vers le modele d'ecriture fichier plat.", operationName);

            await flatFileOperation();
        }
    }
}
