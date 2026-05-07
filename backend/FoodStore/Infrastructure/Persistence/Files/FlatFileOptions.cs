namespace FoodStore.Infrastructure.Persistence.Files;

public sealed class FlatFileOptions
{
    public const string SectionName = "FlatFile";

    public string DataPath { get; init; } = "App_Data/foods.json";

    public string FoodsDirectory { get; init; } = "App_Data/foods";

    public string UsersPath { get; init; } = "App_Data/users.json";
}
