using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace FoodStore.Infrastructure.Persistence.Resilience;

internal static class DatabaseFallback
{
    public static bool IsDatabaseUnavailable(Exception exception)
    {
        return exception is DbException ||
            exception is TimeoutException ||
            exception is InvalidOperationException ||
            exception is DbUpdateException { InnerException: DbException };
    }
}
