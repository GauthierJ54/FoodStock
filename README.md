# FoodStock

FoodStock est une application de gestion de stock alimentaire.

Elle permet de se connecter, consulter son stock, ajouter des aliments, suivre les dates d'expiration, filtrer les produits par categorie ou emplacement, scanner un code-barres et recuperer des donnees produit depuis Open Food Facts.

Le projet est compose de deux parties:

- un frontend React / TypeScript avec Vite;
- un backend ASP.NET Core en .NET 10 avec Minimal API, CQRS, Entity Framework Core et fallback fichier plat.

## Fonctionnalites

- Authentification par JWT.
- Gestion d'un stock alimentaire par utilisateur.
- Ajout, lecture et suppression d'aliments.
- Filtrage par recherche, categorie et emplacement.
- Tri par date d'expiration.
- Detail d'un aliment dans une modale.
- Scan de code-barres par camera ou image.
- Integration Open Food Facts pour pre-remplir le formulaire.
- Interface bilingue francais / anglais.
- Theme clair / sombre persistant.
- Backend SQL avec fallback automatique vers fichiers JSON si SQL est indisponible.

## Stack Technique

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn / Radix UI
- lucide-react
- react-i18next / i18next
- zod
- @zxing/browser
- Vercel Analytics / Speed Insights

### Backend

- .NET 10
- ASP.NET Core Minimal API
- Entity Framework Core 10
- SQL Server / LocalDB
- JWT
- CQRS avec mediation maison
- Stockage fichier plat JSON en fallback
- Swagger / OpenAPI

## Architecture

```txt
FoodStock/
  backend/
    FoodStore/
      Api/
      Application/
      Domain/
      Infrastructure/
      App_Data/
  frontend/
    src/
      api/
      auth/
      components/
      pages/
      theme/
      locales/
      schemas/
  docs/
```

## Backend

Le backend garde une architecture en couches:

```txt
Api/
Application/
Domain/
Infrastructure/
```

### Role Des Couches

- `Api`: endpoints HTTP, Swagger, authentification HTTP et conversion des resultats applicatifs en reponses HTTP.
- `Application`: cas d'utilisation, commandes, queries, handlers, DTOs, read models et interfaces de repositories.
- `Domain`: objets metier principaux, comme `FoodItem` et `FoodFilter`.
- `Infrastructure`: details techniques, EF Core, fichiers plats, JWT, hashing, mediation.

## CQRS

Le backend applique CQRS:

- une Command modifie l'etat;
- une Query lit l'etat.

### Command Side

Les commandes sont rangees par cas d'utilisation:

```txt
backend/FoodStore/Application/Foods/Commands/
  CreateFood/
  UpdateFood/
  SetFoodQuantity/
  DeleteFood/
```

Chaque dossier contient:

- le record de commande;
- le handler associe.

Exemple:

```txt
CreateFood/
  CreateFoodCommand.cs
  CreateFoodHandler.cs
```

Les commandes utilisent:

```txt
Application/Foods/Repositories/IFoodWriteRepository.cs
```

Ce contrat expose uniquement les operations d'ecriture:

- recuperer un aliment pour modification;
- ajouter;
- mettre a jour;
- supprimer.

### Query Side

Les queries sont egalement rangees par cas d'utilisation:

```txt
backend/FoodStore/Application/Foods/Queries/
  GetFoods/
  GetFoodById/
  GetInventorySummary/
```

Les queries utilisent:

```txt
Application/Foods/Repositories/IFoodReadRepository.cs
```

Ce contrat expose uniquement les lectures:

- lister les aliments;
- recuperer un aliment par identifiant.

### Modele De Lecture

Le modele retourne par les lectures est:

```txt
Application/Foods/Models/FoodReadModel.cs
```

Il permet de separer:

- le modele de lecture retourne a l'API;
- le modele domaine `FoodItem`;
- l'entite EF `FoodEntity`.

## Persistance

La persistance est rangee dans:

```txt
backend/FoodStore/Infrastructure/Persistence/
```

### Entity Framework Core

```txt
Infrastructure/Persistence/Ef/
  FoodStoreDbContext.cs
  FoodEntity.cs
  EfFoodReadRepository.cs
  EfFoodWriteRepository.cs
```

`FoodStoreDbContext` configure la table SQL `Foods`.

Points techniques importants:

- cle primaire sur `Id`;
- colonne `UserName` pour isoler les aliments par utilisateur;
- index sur `{ UserName, Name }`;
- index sur `{ UserName, ExpirationDate }`;
- quantites en `decimal(18,3)`;
- limites de taille sur les champs texte;
- projections directes vers `FoodReadModel` cote lecture.

### Fichier Plat

La logique historique est conservee:

```txt
Infrastructure/Persistence/Files/FlatFileFoodRepository.cs
```

Les aliments sont stockes par utilisateur:

```txt
App_Data/foods/{username}.json
```

Ce repository implemente les deux contrats:

- `IFoodReadRepository`;
- `IFoodWriteRepository`.

### Fallback SQL Vers Fichier Plat

Le fallback est gere par:

```txt
Infrastructure/Persistence/Resilience/
  ResilientFoodReadRepository.cs
  ResilientFoodWriteRepository.cs
  DatabaseFallback.cs
```

Le fonctionnement est:

```txt
Handler
  -> IFoodReadRepository ou IFoodWriteRepository
  -> repository resilient
  -> SQL avec EF Core
  -> si SQL indisponible: fichier plat JSON
```

Cela permet a l'API de continuer a fonctionner meme si SQL Server n'est pas joignable.

## Frontend

Le frontend est une application React TypeScript.

Structure principale:

```txt
frontend/src/
  api/
  auth/
  components/
  components/ui/
  locales/
  pages/
  schemas/
  theme/
  App.tsx
  main.tsx
  i18n.ts
```

### Authentification

L'authentification est geree par:

```txt
src/auth/AuthContext.tsx
src/auth/useAuth.ts
```

Le contexte stocke:

- le token JWT;
- le nom d'utilisateur;
- l'etat `isAuthenticated`;
- les fonctions `login` et `logout`.

`App.tsx` affiche:

- `LoginPage` si l'utilisateur n'est pas connecte;
- `StockPage` si l'utilisateur possede un token.

### Client API

Les appels HTTP sont centralises dans:

```txt
src/api/apiClient.ts
```

`apiFetch` ajoute automatiquement:

- `Content-Type: application/json`;
- `Authorization: Bearer <token>`;
- gestion des erreurs HTTP;
- parsing JSON;
- gestion des reponses `204 No Content`.

Les appels stock sont dans:

```txt
src/api/stockAPI.ts
```

Les appels auth sont dans:

```txt
src/api/authAPI.ts
```

L'URL de l'API est configuree avec:

```txt
VITE_API_URL
```

### Pages

```txt
src/pages/LoginPage.tsx
src/pages/StockPage.tsx
```

`LoginPage` gere:

- validation zod;
- appel `/auth/login`;
- affichage des erreurs;
- changement de langue;
- changement de theme.

`StockPage` gere:

- chargement du stock;
- etat local des aliments;
- ajout;
- suppression;
- recherche;
- filtres;
- tri;
- affichage en cartes;
- modale de detail.

### Formulaire Et Code-Barres

Le formulaire d'ajout est:

```txt
src/components/FoodForm.tsx
```

Il gere:

- saisie de l'aliment;
- categorie existante ou nouvelle categorie;
- emplacement existant ou nouvel emplacement;
- calendrier de date d'expiration;
- recherche par code-barres;
- pre-remplissage via Open Food Facts.

Le scanner est:

```txt
src/components/BarcodeScanner.tsx
```

Il utilise `@zxing/browser` pour:

- scanner via camera;
- scanner depuis une image importee;
- liberer les flux camera apres utilisation.

L'integration Open Food Facts est dans:

```txt
src/api/OpenFoodsFactsAPI.ts
```

## Endpoints Backend

Base URL en developpement:

```txt
http://localhost:5175/api
```

### Auth

```txt
POST /api/auth/login
POST /api/auth/register
```

### Foods

```txt
GET    /api/foods
GET    /api/foods/{id}
GET    /api/foods/summary
POST   /api/foods
PUT    /api/foods/{id}
PATCH  /api/foods/{id}/quantity
DELETE /api/foods/{id}
```

Les routes `foods` necessitent un JWT:

```txt
Authorization: Bearer <token>
```

## Prerequis

- Node.js recent
- npm
- .NET SDK 10
- SQL Server LocalDB ou SQL Server

SQL Server est recommande, mais pas strictement bloquant en developpement grace au fallback fichier plat.

## Installation

Depuis la racine du repo:

```powershell
cd frontend
npm install
```

Le backend restaure ses packages avec `dotnet restore` ou automatiquement au build.

```powershell
cd ../backend
dotnet restore FoodStore.sln
```

## Configuration

### Backend

La configuration de developpement est dans:

```txt
backend/FoodStore/appsettings.Development.json
```

Compte de developpement:

```json
{
  "Auth": {
    "Username": "admin",
    "Password": "admin"
  }
}
```

Connection string SQL:

```json
{
  "ConnectionStrings": {
    "FoodStoreSql": "Server=(localdb)\\MSSQLLocalDB;Database=FoodStore_Dev;Trusted_Connection=True;TrustServerCertificate=True;Connection Timeout=3"
  }
}
```

Stockage fichier:

```json
{
  "FlatFile": {
    "DataPath": "App_Data/foods.json",
    "FoodsDirectory": "App_Data/foods",
    "UsersPath": "App_Data/users.json"
  }
}
```

### Frontend

Créer un fichier:

```txt
frontend/.env
```

Avec:

```env
VITE_API_URL=http://localhost:5175/api
```

## Lancement En Developpement

### Backend

Depuis la racine:

```powershell
dotnet run --project backend/FoodStore/FoodStore.csproj
```

Backend:

```txt
http://localhost:5175
```

Swagger en developpement:

```txt
http://localhost:5175/swagger
```

### Frontend

Dans un autre terminal:

```powershell
cd frontend
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

Identifiants de developpement:

```txt
admin / admin
```

## Build

### Backend

```powershell
dotnet build backend/FoodStore.sln
```

### Frontend

```powershell
cd frontend
npm run build
```

## Tests Manuels API

Un fichier HTTP est fourni:

```txt
backend/FoodStore/FoodStore.http
```

Il contient des exemples pour:

- login;
- register;
- lister les aliments;
- creer un aliment;
- recuperer le resume.

## Documentation De Presentation

Des memos techniques sont disponibles:

```txt
docs/memo-presentation-technique.md
docs/memo-presentation-frontend.md
```

Ils expliquent plus en detail:

- l'architecture backend;
- CQRS;
- EF Core;
- fallback fichier plat;
- architecture frontend;
- authentification;
- API client;
- formulaire;
- scanner code-barres;
- internationalisation;
- theme.

## Flux Technique Principal

### Connexion

```txt
LoginPage
  -> loginApi
  -> POST /api/auth/login
  -> JWT
  -> AuthContext.login
  -> StockPage
```

### Chargement Du Stock

```txt
StockPage
  -> getStock(token)
  -> apiFetch
  -> GET /api/foods
  -> GetFoodsQuery
  -> GetFoodsHandler
  -> IFoodReadRepository
  -> SQL ou fichier plat
```

### Creation D'un Aliment

```txt
FoodForm
  -> createFoodItem
  -> POST /api/foods
  -> CreateFoodCommand
  -> CreateFoodHandler
  -> IFoodWriteRepository
  -> SQL ou fichier plat
```

### Scan Code-Barres

```txt
BarcodeScanner
  -> code-barres detecte
  -> Open Food Facts
  -> pre-remplissage FoodForm
  -> creation aliment
```

## Points Techniques Importants

- Le frontend ne connait pas la structure EF ni le stockage fichier.
- Le backend ne depend pas du frontend.
- Les endpoints passent par une mediation interne.
- Les lectures et ecritures sont separees avec CQRS.
- Les repositories applicatifs cachent les details SQL/fichier.
- Le fallback fichier plat permet une meilleure resilience.
- Le token JWT est ajoute automatiquement aux appels proteges.
- Le theme et la langue sont geres globalement.

## Limites Et Ameliorations Possibles

- Ajouter de vraies migrations EF Core a la place de `EnsureCreatedAsync()`.
- Ajouter les tests unitaires des handlers CQRS.
- Ajouter des tests d'integration backend avec SQL et fallback fichier.
- Persister le token frontend dans `sessionStorage` ou `localStorage` si besoin.
- Ajouter l'edition complete d'un aliment dans la modale.
- Ajouter les appels frontend pour `PUT` et `PATCH`.
- Remplacer les `alert`, `confirm` et `console.log` par une gestion UI plus propre.
- Utiliser TanStack Query pour le cache, les erreurs et les rechargements API.
- Deplacer les filtres cote backend si le volume de donnees devient important.

## Commandes Utiles

```powershell
# Backend
dotnet build backend/FoodStore.sln
dotnet run --project backend/FoodStore/FoodStore.csproj

# Frontend
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Resume

FoodStock est une application fullstack de gestion alimentaire.

Le frontend propose une experience utilisateur moderne avec React, TypeScript, theme sombre, internationalisation et scan de code-barres.

Le backend utilise .NET 10, Minimal API, JWT, CQRS, EF Core SQL Server et un fallback fichier plat par utilisateur pour rester fonctionnel meme si la base SQL est indisponible.
