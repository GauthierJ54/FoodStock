using FoodStore.Api.Auth;
using FoodStore.Application.Abstractions;
using FoodStore.Application.Foods;
using FoodStore.Domain.Foods;

namespace FoodStore.Api.Endpoints;

public static class FoodEndpoints
{
    public static IEndpointRouteBuilder MapFoodEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/foods").WithTags("Foods").RequireJwt();

        group.MapGet("/", async (
            string? search,
            string? category,
            bool? expired,
            bool? lowStock,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            var filter = new FoodFilter(search, category, expired, lowStock);
            var foods = await mediator.Send(new GetFoodsQuery(filter), cancellationToken);

            return Results.Ok(foods);
        });

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new GetFoodByIdQuery(id), cancellationToken);

            return result.ToHttpResult();
        });

        group.MapPost("/", async (CreateFoodRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new CreateFoodCommand(request), cancellationToken);

            if (!result.Succeeded)
            {
                return result.ToHttpResult();
            }

            return Results.Created($"/api/foods/{result.Value!.Id}", result.Value);
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateFoodRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new UpdateFoodCommand(id, request), cancellationToken);

            return result.ToHttpResult();
        });

        group.MapPatch("/{id:guid}/quantity", async (Guid id, SetFoodQuantityRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new SetFoodQuantityCommand(id, request), cancellationToken);

            return result.ToHttpResult();
        });

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new DeleteFoodCommand(id), cancellationToken);

            return result.ToHttpResult();
        });

        group.MapGet("/summary", async (IMediator mediator, CancellationToken cancellationToken) =>
        {
            var summary = await mediator.Send(new GetInventorySummaryQuery(), cancellationToken);

            return Results.Ok(summary);
        });

        return app;
    }
}
