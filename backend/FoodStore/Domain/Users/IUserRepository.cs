namespace FoodStore.Domain.Users;

public interface IUserRepository
{
    Task<UserAccount?> GetByUsernameAsync(string username, CancellationToken cancellationToken);

    Task AddAsync(UserAccount user, CancellationToken cancellationToken);
}
