using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed record SetFoodQuantityCommand(Guid Id, SetFoodQuantityRequest Request) : IRequest<ApiResult<FoodReadModel>>;
