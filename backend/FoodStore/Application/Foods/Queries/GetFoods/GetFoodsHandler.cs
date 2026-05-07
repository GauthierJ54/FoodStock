using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed class GetFoodsHandler : IRequestHandler<GetFoodsQuery, IReadOnlyList<FoodReadModel>>
{
    private readonly IFoodReadRepository _readRepository;

    public GetFoodsHandler(IFoodReadRepository readRepository)
    {
        _readRepository = readRepository;
    }

    public Task<IReadOnlyList<FoodReadModel>> Handle(GetFoodsQuery request, CancellationToken cancellationToken)
    {
        return _readRepository.ListAsync(request.Filter, cancellationToken);
    }
}
