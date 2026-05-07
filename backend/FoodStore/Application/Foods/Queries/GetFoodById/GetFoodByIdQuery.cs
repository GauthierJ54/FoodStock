using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed record GetFoodByIdQuery(Guid Id) : IRequest<ApiResult<FoodReadModel>>;
