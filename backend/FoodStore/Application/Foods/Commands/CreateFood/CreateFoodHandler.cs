using FoodStore.Application.Abstractions;
using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public sealed class CreateFoodHandler : IRequestHandler<CreateFoodCommand, ApiResult<FoodReadModel>>
{
    private readonly IFoodWriteRepository _writeRepository;
    private readonly IFoodReadRepository _readRepository;

    public CreateFoodHandler(IFoodWriteRepository writeRepository, IFoodReadRepository readRepository)
    {
        _writeRepository = writeRepository;
        _readRepository = readRepository;
    }

    public async Task<ApiResult<FoodReadModel>> Handle(CreateFoodCommand request, CancellationToken cancellationToken)
    {
        var validationError = FoodCommandRules.Validate(request.Request.Name, request.Request.Quantity, request.Request.Unit, request.Request.MinimumQuantity);

        if (validationError is not null)
        {
            return ApiResult<FoodReadModel>.BadRequest(validationError);
        }

        var now = DateTimeOffset.UtcNow;
        var food = new FoodItem(
            Guid.NewGuid(),
            FoodCommandRules.Clean(request.Request.Name)!,
            FoodCommandRules.Clean(request.Request.Category),
            request.Request.Quantity,
            FoodCommandRules.Clean(request.Request.Unit)!,
            request.Request.ExpirationDate,
            FoodCommandRules.Clean(request.Request.Location),
            request.Request.MinimumQuantity,
            FoodCommandRules.Clean(request.Request.Notes),
            now,
            now);

        await _writeRepository.AddAsync(food, cancellationToken);

        var created = await _readRepository.GetByIdAsync(food.Id, cancellationToken) ?? FoodReadModel.FromDomain(food);

        return ApiResult<FoodReadModel>.Success(created);
    }
}
