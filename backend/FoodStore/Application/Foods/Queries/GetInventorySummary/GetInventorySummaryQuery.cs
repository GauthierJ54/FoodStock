using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed record GetInventorySummaryQuery : IRequest<InventorySummary>;
