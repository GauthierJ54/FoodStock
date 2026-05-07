using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed class SetFoodQuantityHandler : IRequestHandler<SetFoodQuantityCommand, ApiResult<FoodReadModel>>
{
    private readonly IFoodWriteRepository _writeRepository;
    private readonly IFoodReadRepository _readRepository;

    public SetFoodQuantityHandler(IFoodWriteRepository writeRepository, IFoodReadRepository readRepository)
    {
        _writeRepository = writeRepository;
        _readRepository = readRepository;
    }

    public async Task<ApiResult<FoodReadModel>> Handle(SetFoodQuantityCommand request, CancellationToken cancellationToken)
    {
        if (request.Request.Quantity < 0)
        {
            return ApiResult<FoodReadModel>.BadRequest("La quantite ne peut pas etre negative.");
        }

        var existing = await _writeRepository.GetByIdForUpdateAsync(request.Id, cancellationToken);

        if (existing is null)
        {
            return ApiResult<FoodReadModel>.NotFound("Aliment introuvable.");
        }

        var updated = existing with
        {
            Quantity = request.Request.Quantity,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _writeRepository.UpdateAsync(updated, cancellationToken);

        var readModel = await _readRepository.GetByIdAsync(updated.Id, cancellationToken) ?? FoodReadModel.FromDomain(updated);

        return ApiResult<FoodReadModel>.Success(readModel);
    }
}
