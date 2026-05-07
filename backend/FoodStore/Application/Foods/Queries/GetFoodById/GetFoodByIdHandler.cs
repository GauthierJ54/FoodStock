using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed class GetFoodByIdHandler : IRequestHandler<GetFoodByIdQuery, ApiResult<FoodReadModel>>
{
    private readonly IFoodReadRepository _readRepository;

    public GetFoodByIdHandler(IFoodReadRepository readRepository)
    {
        _readRepository = readRepository;
    }

    public async Task<ApiResult<FoodReadModel>> Handle(GetFoodByIdQuery request, CancellationToken cancellationToken)
    {
        var food = await _readRepository.GetByIdAsync(request.Id, cancellationToken);

        return food is null
            ? ApiResult<FoodReadModel>.NotFound("Aliment introuvable.")
            : ApiResult<FoodReadModel>.Success(food);
    }
}
