using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed record UpdateFoodCommand(Guid Id, UpdateFoodRequest Request) : IRequest<ApiResult<FoodReadModel>>;
