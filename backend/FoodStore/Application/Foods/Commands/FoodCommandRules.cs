namespace FoodStore.Application.Foods;

internal static class FoodCommandRules
{
    public static string? Validate(string name, decimal quantity, string unit, decimal? minimumQuantity)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Le nom est obligatoire.";
        }

        if (name.Length > 120)
        {
            return "Le nom ne peut pas depasser 120 caracteres.";
        }

        if (quantity < 0)
        {
            return "La quantite ne peut pas etre negative.";
        }

        if (string.IsNullOrWhiteSpace(unit))
        {
            return "L'unite est obligatoire.";
        }

        if (unit.Length > 24)
        {
            return "L'unite ne peut pas depasser 24 caracteres.";
        }

        if (minimumQuantity < 0)
        {
            return "La quantite minimale ne peut pas etre negative.";
        }

        return null;
    }

    public static string? Clean(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
