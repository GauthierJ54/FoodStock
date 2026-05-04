using FoodStore.Application.Abstractions;
using FoodStore.Domain.Foods;

namespace FoodStore.Application.Foods;

public sealed class GetFoodsHandler : IRequestHandler<GetFoodsQuery, IReadOnlyList<FoodItem>>
{
    private readonly IFoodInventoryOrchestrator _orchestrator;

    public GetFoodsHandler(IFoodInventoryOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public Task<IReadOnlyList<FoodItem>> Handle(GetFoodsQuery request, CancellationToken cancellationToken)
    {
        return _orchestrator.GetFoodsAsync(request.Filter, cancellationToken);
    }
}

public sealed class GetFoodByIdHandler : IRequestHandler<GetFoodByIdQuery, ApiResult<FoodItem>>
{
    private readonly IFoodInventoryOrchestrator _orchestrator;

    public GetFoodByIdHandler(IFoodInventoryOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public Task<ApiResult<FoodItem>> Handle(GetFoodByIdQuery request, CancellationToken cancellationToken)
    {
        return _orchestrator.GetFoodAsync(request.Id, cancellationToken);
    }
}

public sealed class CreateFoodHandler : IRequestHandler<CreateFoodCommand, ApiResult<FoodItem>>
{
    private readonly IFoodInventoryOrchestrator _orchestrator;

    public CreateFoodHandler(IFoodInventoryOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public Task<ApiResult<FoodItem>> Handle(CreateFoodCommand request, CancellationToken cancellationToken)
    {
        return _orchestrator.CreateFoodAsync(request.Request, cancellationToken);
    }
}

public sealed class UpdateFoodHandler : IRequestHandler<UpdateFoodCommand, ApiResult<FoodItem>>
{
    private readonly IFoodInventoryOrchestrator _orchestrator;

    public UpdateFoodHandler(IFoodInventoryOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public Task<ApiResult<FoodItem>> Handle(UpdateFoodCommand request, CancellationToken cancellationToken)
    {
        return _orchestrator.UpdateFoodAsync(request.Id, request.Request, cancellationToken);
    }
}

public sealed class SetFoodQuantityHandler : IRequestHandler<SetFoodQuantityCommand, ApiResult<FoodItem>>
{
    private readonly IFoodInventoryOrchestrator _orchestrator;

    public SetFoodQuantityHandler(IFoodInventoryOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public Task<ApiResult<FoodItem>> Handle(SetFoodQuantityCommand request, CancellationToken cancellationToken)
    {
        return _orchestrator.SetQuantityAsync(request.Id, request.Request, cancellationToken);
    }
}

public sealed class DeleteFoodHandler : IRequestHandler<DeleteFoodCommand, ApiResult>
{
    private readonly IFoodInventoryOrchestrator _orchestrator;

    public DeleteFoodHandler(IFoodInventoryOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public Task<ApiResult> Handle(DeleteFoodCommand request, CancellationToken cancellationToken)
    {
        return _orchestrator.DeleteFoodAsync(request.Id, cancellationToken);
    }
}

public sealed class GetInventorySummaryHandler : IRequestHandler<GetInventorySummaryQuery, InventorySummary>
{
    private readonly IFoodInventoryOrchestrator _orchestrator;

    public GetInventorySummaryHandler(IFoodInventoryOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    public Task<InventorySummary> Handle(GetInventorySummaryQuery request, CancellationToken cancellationToken)
    {
        return _orchestrator.GetSummaryAsync(cancellationToken);
    }
}
