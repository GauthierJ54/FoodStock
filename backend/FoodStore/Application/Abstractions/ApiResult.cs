namespace FoodStore.Application.Abstractions;

public class ApiResult
{
    protected ApiResult(bool succeeded, string? error, int statusCode)
    {
        Succeeded = succeeded;
        Error = error;
        StatusCode = statusCode;
    }

    public bool Succeeded { get; }

    public string? Error { get; }

    public int StatusCode { get; }

    public static ApiResult Success() => new(true, null, StatusCodes.Status204NoContent);

    public static ApiResult Failure(string error, int statusCode) => new(false, error, statusCode);

    public static ApiResult BadRequest(string error) => Failure(error, StatusCodes.Status400BadRequest);

    public static ApiResult NotFound(string error) => Failure(error, StatusCodes.Status404NotFound);
}

public sealed class ApiResult<T> : ApiResult
{
    private ApiResult(bool succeeded, T? value, string? error, int statusCode)
        : base(succeeded, error, statusCode)
    {
        Value = value;
    }

    public T? Value { get; }

    public static ApiResult<T> Success(T value) => new(true, value, null, StatusCodes.Status200OK);

    public new static ApiResult<T> Failure(string error, int statusCode) => new(false, default, error, statusCode);

    public new static ApiResult<T> BadRequest(string error) => new(false, default, error, StatusCodes.Status400BadRequest);

    public new static ApiResult<T> NotFound(string error) => new(false, default, error, StatusCodes.Status404NotFound);
}
