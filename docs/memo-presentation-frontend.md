# Memo de presentation technique - Frontend FoodStock

## 1. Contexte frontend

La partie frontend de FoodStock est une application React permettant a l'utilisateur de:

- se connecter;
- consulter son stock alimentaire;
- ajouter un aliment;
- filtrer et trier les aliments;
- supprimer un aliment;
- consulter le detail d'un aliment;
- scanner ou saisir un code-barres;
- recuperer des informations produit depuis Open Food Facts;
- changer de langue;
- changer de theme clair / sombre.

Le frontend consomme l'API backend ASP.NET Core via des endpoints REST.

## 2. Stack technique

Le frontend utilise:

- React 19;
- TypeScript;
- Vite;
- Tailwind CSS;
- composants UI de style shadcn / Radix;
- lucide-react pour les icones;
- react-i18next et i18next pour la traduction;
- zod pour la validation du formulaire de connexion;
- @zxing/browser pour le scan de codes-barres;
- Vercel Analytics et Speed Insights.

Le projet est configure avec Vite:

```txt
frontend/vite.config.ts
```

Les scripts principaux sont dans:

```txt
frontend/package.json
```

Scripts importants:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

Le script `build` lance d'abord TypeScript, puis construit l'application avec Vite.

## 3. Organisation des dossiers

La structure principale du frontend est:

```txt
src/
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
  index.css
```

Role des dossiers:

- `api`: fonctions d'appel HTTP vers le backend et vers Open Food Facts.
- `auth`: contexte d'authentification et hook d'acces.
- `components`: composants fonctionnels metier comme `FoodForm`, `Navbar`, `BarcodeScanner`.
- `components/ui`: composants UI reutilisables.
- `locales`: fichiers de traduction francais et anglais.
- `pages`: pages principales de l'application.
- `schemas`: schemas de validation avec zod.
- `theme`: gestion du theme clair / sombre.

## 4. Point d'entree React

Le point d'entree est:

```txt
src/main.tsx
```

Il monte l'application React dans le DOM avec:

```tsx
createRoot(document.getElementById('root')!).render(...)
```

L'application est enveloppee par:

- `StrictMode`;
- `ThemeProvider`;
- `AuthProvider`.

Cela signifie que toute l'application peut acceder:

- au theme courant;
- a l'etat d'authentification;
- au token JWT;
- au nom de l'utilisateur connecte.

## 5. Routage applicatif simplifie

Le fichier:

```txt
src/App.tsx
```

decide quelle page afficher selon l'etat d'authentification.

Il n'y a pas de react-router dans ce projet. Le routage est volontairement simple:

```tsx
{isAuthenticated ? <StockPage /> : <LoginPage />}
```

Donc:

- si l'utilisateur possede un token, il voit la page stock;
- sinon, il voit la page de connexion.

`App.tsx` utilise aussi:

- `lazy`;
- `Suspense`.

Cela permet de charger `LoginPage` et `StockPage` seulement au moment necessaire.

Interet technique:

- code splitting;
- chargement initial plus leger;
- affichage d'un fallback pendant le chargement.

## 6. Authentification cote frontend

La gestion de l'authentification est dans:

```txt
src/auth/AuthContext.tsx
src/auth/useAuth.ts
```

`AuthContext` stocke:

- `token`;
- `username`;
- `isAuthenticated`;
- `login`;
- `logout`.

Quand l'utilisateur se connecte, le token JWT retourne par le backend est garde dans l'etat React.

Le hook `useAuth` sert a acceder facilement a ces informations depuis les composants.

Exemples d'utilisation:

- `LoginPage` appelle `login(...)` apres une connexion reussie.
- `StockPage` utilise `token` pour charger les aliments.
- `Navbar` utilise `logout` pour deconnecter l'utilisateur.

## 7. Page de connexion

La page de connexion est:

```txt
src/pages/LoginPage.tsx
```

Elle gere:

- les champs username / password;
- l'etat de chargement;
- les erreurs;
- la validation locale;
- l'appel API de connexion;
- le changement de langue;
- le changement de theme.

La validation utilise zod:

```txt
src/schemas/auth.schema.ts
```

Schema:

```ts
username: z.string().min(1)
password: z.string().min(1)
```

L'appel API de login est dans:

```txt
src/api/authAPI.ts
```

Flux de connexion:

```txt
LoginPage
  -> validation zod
  -> loginApi(username, password)
  -> POST /auth/login
  -> reception du JWT
  -> AuthContext.login(token, username)
  -> App affiche StockPage
```

## 8. Client API centralise

Le client HTTP commun est:

```txt
src/api/apiClient.ts
```

La fonction principale est:

```ts
apiFetch<T>(url, token, options)
```

Elle centralise:

- l'ajout du header `Content-Type: application/json`;
- l'ajout du header `Authorization: Bearer <token>`;
- la gestion des erreurs HTTP;
- le cas `204 No Content`;
- le parsing JSON.

Interet:

- eviter de repeter le code `fetch`;
- uniformiser les appels au backend;
- typer les reponses avec TypeScript.

## 9. API stock

Les appels lies au stock sont dans:

```txt
src/api/stockAPI.ts
```

Types principaux:

- `FoodItem`;
- `CreateFoodItemRequest`.

Fonctions exposees:

- `getStock(token)`;
- `createFoodItem(token, data)`;
- `deleteFoodItem(token, id)`.

Ces fonctions consomment l'API backend:

- `GET /foods`;
- `POST /foods`;
- `DELETE /foods/{id}`.

Le backend est configure via la variable:

```ts
import.meta.env.VITE_API_URL
```

Cela permet de changer l'URL API selon l'environnement sans modifier le code.

## 10. Page stock

La page principale apres connexion est:

```txt
src/pages/StockPage.tsx
```

Elle gere:

- le chargement du stock;
- l'etat local des aliments;
- la creation d'un aliment;
- la suppression d'un aliment;
- la recherche;
- le filtrage par categorie;
- le filtrage par lieu;
- le tri par date d'expiration;
- l'affichage sous forme de cartes;
- l'ouverture d'une modale de detail.

Au chargement:

```txt
useEffect
  -> si token present
  -> getStock(token)
  -> setItems(...)
```

Les filtres sont faits cote client:

- recherche par nom;
- categorie selectionnee;
- lieu selectionne;
- tri alphabetique ou par expiration.

L'etat local utilise `useState`.

Interet:

- interface reactive;
- pas besoin de recharger toute la page;
- mise a jour immediate apres creation ou suppression.

## 11. Formulaire d'ajout d'aliment

Le formulaire est:

```txt
src/components/FoodForm.tsx
```

Il gere les champs:

- nom;
- categorie;
- quantite;
- unite;
- date d'expiration;
- lieu;
- quantite minimale;
- notes;
- code-barres.

Le formulaire est un composant controle: chaque champ est relie a un `useState`.

Lors de la soumission:

```txt
FoodForm
  -> validation minimale locale
  -> construction du CreateFoodItemRequest
  -> onSubmit(data)
  -> StockPage.handleCreate
  -> createFoodItem(token, data)
  -> ajout dans items
```

Le formulaire reutilise les categories et lieux deja existants depuis `items`.

Cela permet:

- de proposer les categories deja utilisees;
- de proposer les emplacements deja utilises;
- de creer une nouvelle categorie ou un nouveau lieu via l'option `custom`.

## 12. Calendrier de date d'expiration

La date d'expiration utilise:

```txt
src/components/ui/calendar.tsx
```

et `react-day-picker`.

Dans `FoodForm`, la locale du calendrier depend de la langue courante:

```tsx
locale={i18n.language === "fr" ? fr : enGB}
```

Donc si l'utilisateur passe l'interface en anglais, le calendrier suit la langue.

## 13. Scanner de code-barres

Le scanner est:

```txt
src/components/BarcodeScanner.tsx
```

Il utilise:

```txt
@zxing/browser
```

Deux modes sont disponibles:

- scan via camera;
- scan depuis une image importee.

### Scan camera

Le composant utilise:

- `useRef` pour pointer vers l'element `<video>`;
- `BrowserMultiFormatReader`;
- `decodeFromVideoDevice`;
- `releaseAllStreams` pour liberer la camera.

Un timeout de 10 secondes evite de laisser la camera ouverte trop longtemps si aucun code-barres n'est detecte.

### Scan image

Pour une image:

- creation d'une URL temporaire avec `URL.createObjectURL`;
- lecture avec `decodeFromImageUrl`;
- liberation avec `URL.revokeObjectURL`.

Cela evite les fuites memoire.

## 14. Integration Open Food Facts

L'appel a Open Food Facts est dans:

```txt
src/api/OpenFoodsFactsAPI.ts
```

La fonction:

```ts
getProductByBarcode(barcode)
```

appelle:

```txt
https://world.openfoodfacts.org/api/v2/product/{barcode}
```

Les champs demandes sont limites:

- `product_name`;
- `product_name_fr`;
- `categories`;
- `quantity`;
- `brands`;
- `image_url`.

Interet technique:

- recuperer automatiquement le nom du produit;
- recuperer une categorie;
- recuperer la marque;
- pre-remplir le formulaire;
- ameliorer l'experience utilisateur.

Flux:

```txt
Scan ou saisie code-barres
  -> getProductByBarcode
  -> Open Food Facts
  -> pre-remplissage du formulaire
```

## 15. Internationalisation

L'internationalisation est configuree dans:

```txt
src/i18n.ts
```

Technos utilisees:

- `i18next`;
- `react-i18next`;
- `i18next-browser-languagedetector`.

Les traductions sont dans:

```txt
src/locales/fr/translation.json
src/locales/en/translation.json
```

La langue par defaut est le francais:

```ts
fallbackLng: "fr"
```

Les composants utilisent:

```tsx
const { t, i18n } = useTranslation();
```

Le changement de langue est accessible:

- sur la page de connexion;
- dans la navbar.

## 16. Theme clair / sombre

La gestion du theme est dans:

```txt
src/theme/ThemeContext.tsx
src/theme/useTheme.ts
```

Le theme peut etre:

- `light`;
- `dark`.

Il est stocke dans:

```txt
localStorage
```

Le provider applique la classe CSS directement sur:

```txt
document.documentElement
```

Cela permet a Tailwind d'utiliser les classes `dark:`.

Flux:

```txt
toggleTheme()
  -> setTheme(...)
  -> mise a jour de la classe html
  -> sauvegarde dans localStorage
```

## 17. Composants UI

Les composants UI sont dans:

```txt
src/components/ui/
```

Exemples:

- `button.tsx`;
- `input.tsx`;
- `card.tsx`;
- `dialog.tsx`;
- `select.tsx`;
- `calendar.tsx`;
- `badge.tsx`;
- `avatar.tsx`.

L'interet est de centraliser les composants visuels reutilisables.

Le projet utilise aussi:

- `clsx`;
- `tailwind-merge`;
- `class-variance-authority`.

Ces outils aident a composer proprement les classes CSS Tailwind.

## 18. Navbar

La barre de navigation est:

```txt
src/components/Navbar.tsx
```

Elle affiche:

- le logo;
- le nom de l'application;
- le sous-titre;
- l'avatar de l'utilisateur;
- le bouton de langue;
- le bouton de theme;
- le bouton de deconnexion.

Elle consomme:

- `useAuth`;
- `useTranslation`;
- `useTheme`.

Cela montre bien la separation entre logique d'authentification, traduction et theme.

## 19. Typage TypeScript

Le frontend utilise TypeScript pour typer:

- les reponses API;
- les requetes envoyees au backend;
- les props des composants;
- les valeurs du contexte d'authentification;
- les valeurs du contexte de theme.

Exemples:

```ts
export type FoodItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  location: string;
  minimumQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

Interet:

- moins d'erreurs a l'execution;
- meilleure completion IDE;
- contrats plus clairs entre frontend et backend.

## 20. Performance et chargement

Plusieurs choix ameliorent le chargement:

- `lazy` et `Suspense` pour les pages;
- `lazy` pour le composant `BarcodeScanner`;
- Vite pour un bundling rapide;
- Vercel Analytics et Speed Insights pour suivre les performances.

Le scanner est charge seulement quand le formulaire en a besoin.

Cela evite de charger la dependance `@zxing/browser` trop tot.

## 21. Flux complet d'ajout d'un aliment

Flux utilisateur:

```txt
Utilisateur connecte
  -> StockPage
  -> FoodForm
  -> saisie manuelle ou scan code-barres
  -> eventuellement Open Food Facts
  -> soumission
  -> createFoodItem
  -> apiFetch avec Bearer token
  -> backend POST /foods
  -> retour FoodItem
  -> ajout dans l'etat local
  -> affichage immediat dans la grille
```

Ce flux montre l'integration entre:

- UI React;
- etat local;
- API externe;
- API backend;
- authentification JWT.

## 22. Flux complet de consultation du stock

```txt
App detecte un token
  -> affiche StockPage
  -> useEffect appelle getStock(token)
  -> apiFetch ajoute Authorization Bearer
  -> backend retourne les aliments
  -> setItems
  -> filtres et tri cote client
  -> affichage sous forme de cards
```

## 23. Ce que j'ai ameliore techniquement

Les points techniques importants du frontend sont:

- application React TypeScript structuree par responsabilite;
- authentification centralisee dans un contexte React;
- client API commun avec gestion du JWT;
- composants reutilisables;
- formulaire controle avec etat local;
- integration d'une API externe Open Food Facts;
- scanner code-barres avec camera et import image;
- interface bilingue francais / anglais;
- theme clair / sombre persistant;
- chargement paresseux de certaines pages et composants;
- UI responsive avec Tailwind CSS.

## 24. Limites actuelles et pistes d'amelioration

Quelques ameliorations possibles:

- persister le token dans `localStorage` ou `sessionStorage` si on veut garder la connexion apres refresh;
- ajouter une vraie edition d'aliment dans la modale;
- ajouter les appels API manquants pour `PUT` et `PATCH`;
- deplacer certains filtres cote backend quand le volume de donnees augmente;
- ajouter React Query ou TanStack Query pour mieux gerer cache, loading et erreurs;
- remplacer les `alert` et `confirm` par des composants UI;
- retirer les `console.log` de debug;
- ajouter des tests unitaires sur les composants critiques;
- ajouter une validation plus complete du formulaire aliment.

## 25. Phrase simple pour presenter le frontend

J'ai construit une interface React TypeScript connectee au backend par JWT. L'application separe les responsabilites entre pages, composants, contexte d'authentification, client API, theme et internationalisation. Elle permet de gerer le stock alimentaire avec une experience enrichie par le scan de code-barres et l'integration Open Food Facts, tout en gardant une interface responsive, bilingue et compatible theme sombre.

## 26. Demonstration possible a l'oral

Pour presenter le frontend, je peux faire cette demonstration:

1. Connexion avec `admin / admin`.
2. Arrivee sur `StockPage`.
3. Chargement du stock via `getStock`.
4. Ajout d'un aliment via `FoodForm`.
5. Scan ou saisie d'un code-barres.
6. Recuperation des donnees Open Food Facts.
7. Soumission vers le backend avec token JWT.
8. Affichage immediat de la nouvelle card.
9. Filtrage par categorie ou emplacement.
10. Changement de langue et de theme.

Cette demonstration montre les aspects les plus importants:

- authentification;
- communication API;
- etat React;
- composants reutilisables;
- integration externe;
- experience utilisateur.
