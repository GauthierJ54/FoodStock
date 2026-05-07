using Microsoft.EntityFrameworkCore;

namespace FoodStore.Infrastructure.Persistence.Ef;

public sealed class FoodStoreDbContext : DbContext
{
    public FoodStoreDbContext(DbContextOptions<FoodStoreDbContext> options)
        : base(options)
    {
    }

    public DbSet<FoodEntity> Foods => Set<FoodEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FoodEntity>(entity =>
        {
            entity.ToTable("Foods");
            entity.HasKey(food => food.Id);

            entity.Property(food => food.UserName)
                .HasMaxLength(128)
                .IsRequired();

            entity.Property(food => food.Name)
                .HasMaxLength(120)
                .IsRequired();

            entity.Property(food => food.Category)
                .HasMaxLength(80);

            entity.Property(food => food.Quantity)
                .HasColumnType("decimal(18,3)");

            entity.Property(food => food.Unit)
                .HasMaxLength(24)
                .IsRequired();

            entity.Property(food => food.Location)
                .HasMaxLength(80);

            entity.Property(food => food.MinimumQuantity)
                .HasColumnType("decimal(18,3)");

            entity.Property(food => food.Notes)
                .HasMaxLength(1000);

            entity.HasIndex(food => new { food.UserName, food.Name });
            entity.HasIndex(food => new { food.UserName, food.ExpirationDate });
        });
    }
}
