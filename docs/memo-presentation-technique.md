# Memo de presentation technique - FoodStock

## 1. Contexte du projet

FoodStock est une application de gestion de stock alimentaire.

Le projet est compose de deux parties:

- un frontend React / TypeScript;
- un backend ASP.NET Core minimal API en .NET 10.

Au depart, le backend stockait les aliments dans des fichiers JSON, avec un fichier plat par utilisateur. Cette solution etait simple et pratique, mais elle limitait l'evolution du projet:

- pas de vraie base relationnelle;
- recherches et filtres faits en memoire;
- pas de structure persistante SQL;
- couplage assez fort entre lecture, ecriture et stockage fichier.

L'objectif technique a donc ete de faire evoluer le backend vers une architecture plus robuste avec Entity Framework Core, SQL Server et CQRS, tout en conservant le fallback historique vers les fichiers plats si la base SQL est indisponible.

## 2. Objectifs techniques

Les objectifs etaient les suivants:

- garder l'architecture globale existante du projet;
- conserver ASP.NET Core minimal API;
- utiliser Entity Framework Core en .NET 10;
- stocker les aliments dans une base SQL;
- separer clairement les lectures et les ecritures avec CQRS;
- conserver la logique fichier plat par utilisateur comme solution de secours;
- ne pas casser les contrats API consommes par le frontend.

## 3. Architecture globale conservee

Le backend garde une architecture par couches:

```txt
Api/
Application/
Domain/
Infrastructure/
```

Le role de chaque couche est le suivant:

- `Api`: expose les endpoints HTTP et traduit les resultats applicatifs en reponses HTTP.
- `Application`: contient les cas d'utilisation, les commandes, les queries, les handlers et les contrats de persistance.
- `Domain`: contient les objets metier principaux, comme `FoodItem` et `FoodFilter`.
- `Infrastructure`: contient les details techniques, comme EF Core, SQL Server, les fichiers plats, le JWT et la mediation.

Cette separation evite que l'API connaisse directement EF Core ou le stockage fichier.

## 4. Mise en place de CQRS

CQRS signifie Command Query Responsibility Segregation.

Le principe applique ici est simple:

- une Command modifie l'etat;
- une Query lit l'etat;
- les deux chemins sont separes dans le code.

### Command side

Les commandes sont rangees dans:

```txt
Application/Foods/Commands/
```

Commandes implementees:

- `CreateFoodCommand`: cree un aliment;
- `UpdateFoodCommand`: modifie un aliment complet;
- `SetFoodQuantityCommand`: modifie uniquement la quantite;
- `DeleteFoodCommand`: supprime un aliment.

Chaque commande a son propre dossier avec:

- le record de commande;
- le handler associe.

Exemple:

```txt
Application/Foods/Commands/CreateFood/
  CreateFoodCommand.cs
  CreateFoodHandler.cs
```

Les handlers de commande utilisent `IFoodWriteRepository`.

Ce contrat donne acces uniquement aux operations necessaires a l'ecriture:

- recuperer un aliment pour modification;
- ajouter un aliment;
- mettre a jour un aliment;
- supprimer un aliment.

Cela empeche les commandes de devenir des services de lecture generiques.

### Query side

Les queries sont rangees dans:

```txt
Application/Foods/Queries/
```

Queries implementees:

- `GetFoodsQuery`: liste les aliments avec filtres;
- `GetFoodByIdQuery`: lit un aliment precis;
- `GetInventorySummaryQuery`: calcule le resume du stock.

Chaque query a aussi son propre dossier:

```txt
Application/Foods/Queries/GetFoods/
  GetFoodsQuery.cs
  GetFoodsHandler.cs
```

Les handlers de query utilisent `IFoodReadRepository`.

Ce contrat expose uniquement les lectures:

- lister les aliments;
- recuperer un aliment par identifiant.

## 5. Modele de lecture separe

Un modele de lecture dedie a ete ajoute:

```txt
Application/Foods/Models/FoodReadModel.cs
```

Il represente les donnees retournees par l'API lors des lectures.

L'interet est de ne pas exposer directement l'entite EF ni forcement le modele domaine dans les reponses de lecture.

Dans l'implementation EF, les queries projettent directement depuis SQL vers `FoodReadModel`.

Cela permet:

- d'eviter de charger des objets inutiles;
- de garder un modele optimise pour l'affichage;
- de separer le modele de lecture du modele d'ecriture.

## 6. Domaine plus pur

Le domaine contient maintenant les objets metier:

```txt
Domain/Foods/
  FoodItem.cs
  FoodFilter.cs
```

Le contrat `IFoodWriteRepository` a ete deplace dans `Application/Foods/Repositories`.

Raison: une interface de repository est un besoin applicatif. Le domaine ne doit pas forcement connaitre la persistance.

Cela garde le domaine plus simple et plus independant.

## 7. Persistance SQL avec Entity Framework Core

La partie EF Core est rangee dans:

```txt
Infrastructure/Persistence/Ef/
```

Fichiers principaux:

- `FoodStoreDbContext.cs`;
- `FoodEntity.cs`;
- `EfFoodReadRepository.cs`;
- `EfFoodWriteRepository.cs`.

### DbContext

`FoodStoreDbContext` configure l'acces SQL via EF Core.

Il expose:

```csharp
public DbSet<FoodEntity> Foods => Set<FoodEntity>();
```

La table SQL est configuree dans `OnModelCreating`.

Configuration importante:

- table `Foods`;
- cle primaire sur `Id`;
- colonne `UserName` obligatoire;
- index sur `{ UserName, Name }`;
- index sur `{ UserName, ExpirationDate }`;
- precision SQL pour les quantites avec `decimal(18,3)`;
- limites de longueur sur les champs texte.

Le champ `UserName` est essentiel: il permet de conserver la logique multi-utilisateur. Chaque utilisateur ne lit et ne modifie que ses propres aliments.

### Entite EF

`FoodEntity` represente la table SQL.

Elle est separee de `FoodItem`.

Raison:

- `FoodEntity` est un detail de persistance;
- `FoodItem` reste un objet metier;
- la couche Application ne depend pas de l'entite EF.

## 8. Separation read repository / write repository

Deux repositories EF ont ete crees.

### Lecture SQL

```txt
Infrastructure/Persistence/Ef/EfFoodReadRepository.cs
```

Il implemente `IFoodReadRepository`.

Il utilise:

- `AsNoTracking()` pour eviter le tracking EF inutile en lecture;
- des projections directes vers `FoodReadModel`;
- des filtres SQL pour recherche, categorie, expiration et stock bas.

Les lectures ne modifient jamais le contexte EF.

### Ecriture SQL

```txt
Infrastructure/Persistence/Ef/EfFoodWriteRepository.cs
```

Il implemente `IFoodWriteRepository`.

Il gere:

- creation avec `Add`;
- modification avec chargement de l'entite SQL puis mise a jour;
- suppression avec `ExecuteDeleteAsync`;
- lecture de l'etat courant uniquement pour preparer une modification.

Cette separation rend le CQRS visible jusque dans l'infrastructure.

## 9. Fallback vers fichier plat

La logique fichier plat existante a ete conservee dans:

```txt
Infrastructure/Persistence/Files/FlatFileFoodRepository.cs
```

Ce repository implemente les deux contrats:

- `IFoodReadRepository`;
- `IFoodWriteRepository`.

Il continue a stocker les donnees dans:

```txt
App_Data/foods/{username}.json
```

Cela conserve la logique d'origine: un fichier JSON par utilisateur.

## 10. Repositories resilients

Deux repositories resilients ont ete ajoutes:

```txt
Infrastructure/Persistence/Resilience/
  ResilientFoodReadRepository.cs
  ResilientFoodWriteRepository.cs
  DatabaseFallback.cs
```

Leur role:

1. essayer SQL en premier;
2. intercepter les erreurs liees a l'indisponibilite de la base;
3. basculer automatiquement vers le fichier plat.

Les erreurs interceptees incluent:

- `DbException`;
- `TimeoutException`;
- `InvalidOperationException`;
- `DbUpdateException` avec une exception SQL interne.

Ce mecanisme permet a l'API de continuer a fonctionner si SQL Server est indisponible.

## 11. Cablage dans Program.cs

Le cablage se fait dans:

```txt
backend/FoodStore/Program.cs
```

EF Core est configure avec SQL Server:

```csharp
builder.Services.AddDbContext<FoodStoreDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("FoodStoreSql") ??
        "Server=(localdb)\\MSSQLLocalDB;Database=FoodStore;Trusted_Connection=True;TrustServerCertificate=True;Connection Timeout=3";

    options.UseSqlServer(connectionString);
});
```

Le timeout de connexion est court pour ne pas bloquer longtemps l'application si SQL est indisponible.

Les repositories sont cabales ainsi:

```csharp
builder.Services.AddScoped<EfFoodReadRepository>();
builder.Services.AddScoped<EfFoodWriteRepository>();
builder.Services.AddScoped<IFoodReadRepository, ResilientFoodReadRepository>();
builder.Services.AddScoped<IFoodWriteRepository, ResilientFoodWriteRepository>();
```

Donc les handlers ne connaissent pas directement EF Core.

Ils connaissent uniquement:

- `IFoodReadRepository`;
- `IFoodWriteRepository`.

## 12. Mediation interne

Le projet utilise une mediation maison:

```txt
Application/Abstractions/IMediator.cs
Infrastructure/Mediation/SimpleMediator.cs
```

Les endpoints HTTP n'appellent pas les handlers directement.

Ils envoient une commande ou une query via `IMediator`.

Exemple logique:

```txt
Endpoint HTTP
  -> IMediator.Send(...)
  -> Handler
  -> Repository
  -> SQL ou fichier plat
```

Cela reduit le couplage entre l'API et les cas d'utilisation.

## 13. Endpoints API

Les endpoints sont exposes dans:

```txt
Api/Endpoints/FoodEndpoints.cs
```

Correspondance CQRS:

- `GET /api/foods` -> `GetFoodsQuery`;
- `GET /api/foods/{id}` -> `GetFoodByIdQuery`;
- `GET /api/foods/summary` -> `GetInventorySummaryQuery`;
- `POST /api/foods` -> `CreateFoodCommand`;
- `PUT /api/foods/{id}` -> `UpdateFoodCommand`;
- `PATCH /api/foods/{id}/quantity` -> `SetFoodQuantityCommand`;
- `DELETE /api/foods/{id}` -> `DeleteFoodCommand`.

Cette organisation rend le role de chaque endpoint explicite.

## 14. Securite et utilisateur courant

Le backend utilise un JWT.

La couche infrastructure contient:

- `JwtAuthenticationMiddleware`;
- `CurrentUserService`;
- `JwtTokenService`;
- `Pbkdf2PasswordHasher`.

`CurrentUserService` permet aux repositories de connaitre l'utilisateur courant.

Cela sert a filtrer les aliments:

- en SQL via la colonne `UserName`;
- en fichier plat via le nom du fichier `{username}.json`.

## 15. Ce que j'ai ameliore techniquement

Les ameliorations principales sont:

- passage d'un stockage fichier uniquement a un stockage SQL avec EF Core;
- conservation d'un fallback fichier plat robuste;
- separation CQRS claire entre commandes et queries;
- separation des contrats de lecture et d'ecriture;
- modele de lecture dedie avec `FoodReadModel`;
- entite EF separee du modele domaine;
- domaine moins couple a la persistance;
- infrastructure mieux rangee sous `Persistence`;
- handlers ranges par cas d'utilisation;
- injection de dependances explicite dans `Program.cs`;
- maintien de la compatibilite avec le frontend.

## 16. Limites actuelles et pistes d'amelioration

Le projet est plus propre, mais il reste des evolutions possibles:

- remplacer `EnsureCreatedAsync()` par de vraies migrations EF Core;
- ajouter des tests unitaires pour les handlers;
- ajouter des tests d'integration pour SQL et le fallback fichier plat;
- isoler encore plus les DTO API si le contrat frontend evolue;
- ajouter un mecanisme de synchronisation entre fichier plat et SQL si le fallback est utilise longtemps;
- ajouter une strategie de logs plus detaillee pour les bascules SQL -> fichier.

## 17. Phrase simple pour presenter le choix d'architecture

J'ai garde l'architecture initiale du projet, mais j'ai rendu le backend plus robuste en separant clairement les lectures et les ecritures avec CQRS. Les lectures passent par un modele de lecture dedie, les ecritures passent par un repository d'ecriture, et l'infrastructure utilise SQL Server via Entity Framework Core tout en conservant le stockage fichier plat comme fallback si la base est indisponible.

## 18. Demonstration possible a l'oral

Pour presenter le flux, je peux prendre l'exemple de la creation d'un aliment:

```txt
POST /api/foods
  -> CreateFoodCommand
  -> CreateFoodHandler
  -> validation metier
  -> IFoodWriteRepository
  -> ResilientFoodWriteRepository
  -> EfFoodWriteRepository
  -> SQL Server
```

Si SQL est indisponible:

```txt
EfFoodWriteRepository echoue
  -> ResilientFoodWriteRepository intercepte l'erreur
  -> FlatFileFoodRepository
  -> App_Data/foods/{username}.json
```

Pour une lecture:

```txt
GET /api/foods
  -> GetFoodsQuery
  -> GetFoodsHandler
  -> IFoodReadRepository
  -> ResilientFoodReadRepository
  -> EfFoodReadRepository
  -> projection vers FoodReadModel
```

Cette demonstration montre bien la separation Command / Query et la resilience du stockage.
