using FoodStore.Application.Abstractions;

namespace FoodStore.Application.Foods;

public sealed class DeleteFoodHandler : IRequestHandler<DeleteFoodCommand, ApiResult>
{
    private readonly IFoodWriteRepository _writeRepository;

    public DeleteFoodHandler(IFoodWriteRepository writeRepository)
    {
        _writeRepository = writeRepository;
    }

    public async Task<ApiResult> Handle(DeleteFoodCommand request, CancellationToken cancellationToken)
    {
        var deleted = await _writeRepository.DeleteAsync(request.Id, cancellationToken);

        return deleted
            ? ApiResult.Success()
            : ApiResult.NotFound("Aliment introuvable.");
    }
}
