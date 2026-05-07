using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed class UpdateFoodHandler : IRequestHandler<UpdateFoodCommand, ApiResult<FoodReadModel>>
{
    private readonly IFoodWriteRepository _writeRepository;
    private readonly IFoodReadRepository _readRepository;

    public UpdateFoodHandler(IFoodWriteRepository writeRepository, IFoodReadRepository readRepository)
    {
        _writeRepository = writeRepository;
        _readRepository = readRepository;
    }

    public async Task<ApiResult<FoodReadModel>> Handle(UpdateFoodCommand request, CancellationToken cancellationToken)
    {
        var existing = await _writeRepository.GetByIdForUpdateAsync(request.Id, cancellationToken);

        if (existing is null)
        {
            return ApiResult<FoodReadModel>.NotFound("Aliment introuvable.");
        }

        var validationError = FoodCommandRules.Validate(request.Request.Name, request.Request.Quantity, request.Request.Unit, request.Request.MinimumQuantity);

        if (validationError is not null)
        {
            return ApiResult<FoodReadModel>.BadRequest(validationError);
        }

        var updated = existing with
        {
            Name = FoodCommandRules.Clean(request.Request.Name)!,
            Category = FoodCommandRules.Clean(request.Request.Category),
            Quantity = request.Request.Quantity,
            Unit = FoodCommandRules.Clean(request.Request.Unit)!,
            ExpirationDate = request.Request.ExpirationDate,
            Location = FoodCommandRules.Clean(request.Request.Location),
            MinimumQuantity = request.Request.MinimumQuantity,
            Notes = FoodCommandRules.Clean(request.Request.Notes),
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _writeRepository.UpdateAsync(updated, cancellationToken);

        var readModel = await _readRepository.GetByIdAsync(updated.Id, cancellationToken) ?? FoodReadModel.FromDomain(updated);

        return ApiResult<FoodReadModel>.Success(readModel);
    }
}
