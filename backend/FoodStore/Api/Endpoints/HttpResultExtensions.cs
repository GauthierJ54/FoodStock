using FoodStore.Application.Abstractions;

namespace FoodStore.Api.Endpoints;

public static class HttpResultExtensions
{
    public static IResult ToHttpResult<T>(this ApiResult<T> result)
    {
        if (result.Succeeded)
        {
            return Results.Ok(result.Value);
        }

        return Error(result);
    }

    public static IResult ToHttpResult(this ApiResult result)
    {
        if (result.Succeeded)
        {
            return Results.NoContent();
        }

        return Error(result);
    }

    private static IResult Error(ApiResult result)
    {
        var payload = new { error = result.Error };

        return result.StatusCode switch
        {
            StatusCodes.Status400BadRequest => Results.BadRequest(payload),
            StatusCodes.Status401Unauthorized => Results.Json(payload, statusCode: StatusCodes.Status401Unauthorized),
            StatusCodes.Status404NotFound => Results.NotFound(payload),
            _ => Results.Problem(result.Error, statusCode: result.StatusCode)
        };
    }
}
