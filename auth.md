# Prompt pour Implémentation Auth Frontend - Expo 54 / React Native

## Contexte

API NestJS avec authentification JWT complète. Endpoints disponibles :

- POST /auth/register (email, password, firstName, lastName, dateOfBirth?)
- POST /auth/login (email, password)
- POST /auth/refresh (refreshToken)
- POST /auth/logout (Bearer token requis)
- GET /auth/profile (Bearer token requis)
- POST /auth/change-password (Bearer token requis, oldPassword, newPassword)

## Configuration JWT

- Access token : 15 minutes
- Refresh token : 7 jours
- Format : Bearer token dans header Authorization
- Réponse auth : { accessToken, refreshToken, expiresIn, user: { id, email, firstName, lastName, roles } }

## Exigences Techniques

### Stack Requis

- Expo 54
- React Native
- TypeScript
- AsyncStorage pour persistance tokens
- Axios ou fetch pour API calls
- React Query ou SWR pour cache/state management
- React Navigation pour navigation

### Architecture Demandée

#### 1. Context d'Authentification

- AuthContext avec état global auth
- Provider avec logique complète auth
- Hooks personnalisés useAuth()
- Gestion automatique refresh token
- Persistance état auth au redémarrage app

#### 2. Services API

- Service API centralisé avec intercepteurs
- Gestion automatique Bearer token
- Retry automatique avec refresh token
- Gestion erreurs 401/403 centralisée
- Types TypeScript pour toutes les réponses

#### 3. Navigation et Protection

- Stack navigator avec écrans auth/public
- Guards de navigation basés sur état auth
- Redirection automatique login/profile
- Protection routes privées

#### 4. Composants UI

- Formulaires login/register avec validation
- Loading states et error handling
- Logout functionality
- Change password form

#### 5. Sécurité

- Stockage sécurisé tokens (AsyncStorage chiffré si possible)
- Validation côté client des données
- Gestion timeout sessions
- Nettoyage tokens au logout

## Structure de Fichiers Demandée

```
src/
  auth/
    AuthContext.tsx
    AuthProvider.tsx
    useAuth.ts
    types.ts
  services/
    api.ts
    authService.ts
  navigation/
    AuthNavigator.tsx
    AppNavigator.tsx
    ProtectedRoute.tsx
  screens/
    auth/
      LoginScreen.tsx
      RegisterScreen.tsx
    profile/
      ProfileScreen.tsx
      ChangePasswordScreen.tsx
  components/
    auth/
      LoginForm.tsx
      RegisterForm.tsx
      ChangePasswordForm.tsx
  utils/
    storage.ts
    validation.ts
```

## Fonctionnalités Obligatoires

### AuthContext

- État : { user, tokens, isLoading, isAuthenticated }
- Actions : login, register, logout, refreshToken, updateProfile
- Auto-refresh token avant expiration
- Persistance état au démarrage app

### API Service

- Base URL configurable
- Intercepteurs pour Bearer token automatique
- Retry avec refresh token sur 401
- Types pour toutes les réponses API
- Gestion erreurs centralisée

### Navigation

- Stack auth (login, register)
- Stack app principal (profile, etc.)
- Redirection automatique selon état auth
- Protection routes avec guards

### Composants

- Formulaires avec validation
- Loading states
- Error messages
- Logout button

## Types TypeScript Requis

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}
```

## Gestion d'Erreurs

- Messages erreurs utilisateur-friendly
- Retry automatique pour erreurs réseau
- Fallback pour refresh token échoué
- Logout automatique si refresh impossible

## Validation Côté Client

- Email format validation
- Password minimum 6 caractères
- Required fields validation
- Real-time validation feedback

## Performance

- Lazy loading des écrans
- Memoization des composants coûteux
- Optimisation re-renders
- Cache API responses

## Tests

- Tests unitaires pour services
- Tests d'intégration pour auth flow
- Mocks pour API calls

## Configuration

- Variables d'environnement pour API URL
- Configuration dev/prod
- Debug mode pour logs auth

## Instructions Spécifiques

1. Créer AuthContext avec état complet et actions
2. Implémenter service API avec intercepteurs et retry
3. Configurer navigation avec protection routes
4. Créer composants formulaires avec validation
5. Ajouter persistance tokens et état
6. Implémenter auto-refresh token
7. Gérer erreurs et loading states
8. Ajouter types TypeScript complets
9. Optimiser performance et re-renders
10. Ajouter tests unitaires de base

## Points Critiques

- Gestion automatique refresh token transparente
- Persistance état auth au redémarrage
- Protection routes avec guards
- Gestion erreurs centralisée
- Types TypeScript stricts
- Performance optimisée
- Sécurité tokens
