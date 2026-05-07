using FoodStore.Api.Auth;
using FoodStore.Api.Endpoints;
using FoodStore.Application.Abstractions;
using FoodStore.Application.Auth;
using FoodStore.Application.Foods;
using FoodStore.Domain.Users;
using FoodStore.Infrastructure.Auth;
using FoodStore.Infrastructure.Mediation;
using FoodStore.Infrastructure.Persistence.Ef;
using FoodStore.Infrastructure.Persistence.Files;
using FoodStore.Infrastructure.Persistence.Resilience;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FoodStore API",
        Version = "v1",
        Description = "API minimaliste pour gerer les aliments de la maison."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Collez uniquement le token JWT retourne par /api/auth/login."
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", null, null),
            []
        }
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "https://food-stock-roan.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));
builder.Services.Configure<FlatFileOptions>(builder.Configuration.GetSection(FlatFileOptions.SectionName));

builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<ICurrentUserService, CurrentUserService>();
builder.Services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddSingleton<IUserRepository, FlatFileUserRepository>();
builder.Services.AddSingleton<FlatFileFoodRepository>();
builder.Services.AddDbContext<FoodStoreDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("FoodStoreSql") ??
        "Server=(localdb)\\MSSQLLocalDB;Database=FoodStore;Trusted_Connection=True;TrustServerCertificate=True;Connection Timeout=3";

    options.UseSqlServer(connectionString);
});
builder.Services.AddScoped<EfFoodReadRepository>();
builder.Services.AddScoped<EfFoodWriteRepository>();
builder.Services.AddScoped<IFoodReadRepository, ResilientFoodReadRepository>();
builder.Services.AddScoped<IFoodWriteRepository, ResilientFoodWriteRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMediator, SimpleMediator>();

builder.Services.AddScoped<IRequestHandler<GetFoodsQuery, IReadOnlyList<FoodReadModel>>, GetFoodsHandler>();
builder.Services.AddScoped<IRequestHandler<GetFoodByIdQuery, ApiResult<FoodReadModel>>, GetFoodByIdHandler>();
builder.Services.AddScoped<IRequestHandler<CreateFoodCommand, ApiResult<FoodReadModel>>, CreateFoodHandler>();
builder.Services.AddScoped<IRequestHandler<UpdateFoodCommand, ApiResult<FoodReadModel>>, UpdateFoodHandler>();
builder.Services.AddScoped<IRequestHandler<SetFoodQuantityCommand, ApiResult<FoodReadModel>>, SetFoodQuantityHandler>();
builder.Services.AddScoped<IRequestHandler<DeleteFoodCommand, ApiResult>, DeleteFoodHandler>();
builder.Services.AddScoped<IRequestHandler<GetInventorySummaryQuery, InventorySummary>, GetInventorySummaryHandler>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<FoodStoreDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
    }
    catch (Exception exception)
    {
        logger.LogWarning(exception, "La base SQL est indisponible au demarrage. Le stockage fichier plat prendra le relais.");
    }
}

app.UseCors("Frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "FoodStore API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseMiddleware<JwtAuthenticationMiddleware>();

app.MapAuthEndpoints();
app.MapFoodEndpoints();

app.Run();
