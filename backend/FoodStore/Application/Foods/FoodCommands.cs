using FoodStore.Application.Abstractions;
using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public sealed record GetFoodsQuery(FoodFilter Filter) : IRequest<IReadOnlyList<FoodItem>>;

public sealed record GetFoodByIdQuery(Guid Id) : IRequest<ApiResult<FoodItem>>;

public sealed record CreateFoodCommand(CreateFoodRequest Request) : IRequest<ApiResult<FoodItem>>;

public sealed record UpdateFoodCommand(Guid Id, UpdateFoodRequest Request) : IRequest<ApiResult<FoodItem>>;

public sealed record SetFoodQuantityCommand(Guid Id, SetFoodQuantityRequest Request) : IRequest<ApiResult<FoodItem>>;

public sealed record DeleteFoodCommand(Guid Id) : IRequest<ApiResult>;

public sealed record GetInventorySummaryQuery : IRequest<InventorySummary>;
