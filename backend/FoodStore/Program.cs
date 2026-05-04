using FoodStore.Api.Auth;
using FoodStore.Api.Endpoints;
using FoodStore.Application.Abstractions;
using FoodStore.Application.Auth;
using FoodStore.Application.Foods;
using FoodStore.Domain.Foods;
using FoodStore.Domain.Users;
using FoodStore.Infrastructure.Auth;
using FoodStore.Infrastructure.Files;
using FoodStore.Infrastructure.Mediation;
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
builder.Services.Configure<FlatFileOptions>(builder.Configuration.GetSection(FlatFileOptions.SectionName));

builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<ICurrentUserService, CurrentUserService>();
builder.Services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddSingleton<IUserRepository, FlatFileUserRepository>();
builder.Services.AddSingleton<IFoodRepository, FlatFileFoodRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFoodInventoryOrchestrator, FoodInventoryOrchestrator>();
builder.Services.AddScoped<IMediator, SimpleMediator>();

builder.Services.AddScoped<IRequestHandler<GetFoodsQuery, IReadOnlyList<FoodItem>>, GetFoodsHandler>();
builder.Services.AddScoped<IRequestHandler<GetFoodByIdQuery, ApiResult<FoodItem>>, GetFoodByIdHandler>();
builder.Services.AddScoped<IRequestHandler<CreateFoodCommand, ApiResult<FoodItem>>, CreateFoodHandler>();
builder.Services.AddScoped<IRequestHandler<UpdateFoodCommand, ApiResult<FoodItem>>, UpdateFoodHandler>();
builder.Services.AddScoped<IRequestHandler<SetFoodQuantityCommand, ApiResult<FoodItem>>, SetFoodQuantityHandler>();
builder.Services.AddScoped<IRequestHandler<DeleteFoodCommand, ApiResult>, DeleteFoodHandler>();
builder.Services.AddScoped<IRequestHandler<GetInventorySummaryQuery, InventorySummary>, GetInventorySummaryHandler>();

var app = builder.Build();
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
