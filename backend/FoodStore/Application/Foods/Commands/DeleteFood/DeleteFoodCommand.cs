using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed record DeleteFoodCommand(Guid Id) : IRequest<ApiResult>;
