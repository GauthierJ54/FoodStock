using FoodStore.Application.Abstractions;
using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public sealed record GetFoodsQuery(FoodFilter Filter) : IRequest<IReadOnlyList<FoodReadModel>>;
