using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed record CreateFoodCommand(CreateFoodRequest Request) : IRequest<ApiResult<FoodReadModel>>;
