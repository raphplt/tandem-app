# Onboarding Solow — Guide Frontend

Ce guide résume tout ce qu’il faut implémenter côté app (Expo/React Native) pour consommer le nouvel onboarding progressif.

---

## 1. Gestion du draft

- **Identifiants locaux :**
  - `deviceId` (UUID stable pour l’appareil).
  - `draftId`, `draftToken`, `expiresAt` (stockés en SecureStore/MMKV).
- **Créer ou mettre à jour le draft :**

  ```http
  POST /onboarding/drafts
  Content-Type: application/json

  {
    "deviceId": "device-uuid",
    "draftToken": "optionnel-si-déjà-reçu",
    "payload": { "stepKey": { ...partialData } }
  }
  ```

  - Réponse : `{ draftId, deviceId, payload, expiresAt, draftToken }`.
  - Le payload est fusionné côté serveur (merge profond). `null` supprime une clé.

- **Reprendre un draft :**
  ```http
  GET /onboarding/drafts/:deviceId
  x-draft-token: <draftToken>  // ou ?draftToken=
  ```
  - 200 → hydrate l’onboarding local avec `payload`.
  - 404 → draft inexistant ou expiré (TTL 72h) ▶ recommencer.

---

## 2. Étapes publiques (avant authentification)

### 2.1 Identité / intentions

```http
POST /profiles/draft
Content-Type: application/json

{
  "draftId": "uuid",
  "draftToken": "secret",
  "firstName": "Alice",
  "birthdate": "1995-06-15",  // ISO, >=18 ans
  "gender": "female",         // enum Gender
  "seeking": ["male"],        // 1 à 3 items
  "intention": "rencontres sérieuses",
  "city": "Paris",
  "country": "FR",
  "lat": 48.8566,
  "lng": 2.3522,
  "bio": "240 caractères max"
}
```

- `Gender` = `'male' | 'female' | 'non_binary' | 'other' | 'prefer_not_to_say'`.
- Réponse : draft mis à jour (même shape que `POST /onboarding/drafts`).

### 2.2 Préférences

```http
POST /profiles/draft/preferences

{
  "draftId": "...",
  "draftToken": "...",
  "ageMin": 25,   // 18..90
  "ageMax": 35,   // >= ageMin
  "distanceKm": 30 // 1..500
}
```

### 2.3 Centres d’intérêt

```http
POST /profiles/draft/interests

{
  "draftId": "...",
  "draftToken": "...",
  "interestSlugs": ["hiking", "cinema"] // 1..5 éléments existant côté catalogue
}
```

### 2.4 Photos via Cloudflare R2

1. **Demander un lien presigné :**

   ```http
   POST /media/presign
   Content-Type: application/json

   {
     "contentType": "image/jpeg",
     "scope": "photos/profile",
     "draftId": "...",        // requis si user pas authentifié
     "draftToken": "..."
   }
   ```

   - Réponse : `{ url, key, publicUrl?, expiresIn }`.

2. **Uploader l’image :**
   - `PUT url` avec `Content-Type` identique + binaire du fichier.
3. **Répercuter sur le draft :**
   ```http
   POST /onboarding/drafts
   {
     "deviceId": "...",
     "draftToken": "...",
     "payload": { "photos": ["publicUrl1", "publicUrl2"] }
   }
   ```

---

## 3. Authentification (merge draft → user)

> Les endpoints auth sont en cours d’intégration pour consommer `draftId`/`draftToken`. Workflow attendu :

1. L’utilisateur sélectionne Apple / Google / Phone.
2. L’app appelle `/auth/{provider}` en ajoutant dans le body :
   ```json
   {
     "...providerPayload",
     "draftId": "...",
     "draftToken": "..."
   }
   ```
3. Le backend :
   - crée ou réutilise un `user`,
   - fusionne le draft vers `profiles`, `profile_preferences`, `photos`,
   - marque `onboarded_at`,
   - invalide le draft,
   - renvoie la session (`AuthResponseDto`).

Pendant l’attente de cette fusion côté API, conserve `draftId/token` prêtes à être envoyées.

---

## 4. Post-auth (profil connecté)

- `GET /users/me/profile` → `ProfileResponseDto`
  ```ts
  type ProfileResponseDto = {
  	userId: string;
  	firstName?: string;
  	birthdate?: string;
  	gender?: Gender;
  	seeking: Gender[];
  	intention?: string;
  	city?: string;
  	country?: string;
  	lat?: number;
  	lng?: number;
  	bio?: string;
  	publishedAt?: string;
  	preferences: { ageMin: number; ageMax: number; distanceKm: number };
  	interests: string[];
  	photos: { url: string; position: number }[];
  };
  ```
- `PUT /users/me/profile` (body = `UpdateProfileDto`, mêmes champs que la draft mais optionnels).
- `PUT /users/me/preferences` (body = `UpdatePreferencesDto` avec `ageMin`, `ageMax`, `distanceKm` optionnels).
- `POST /users/me/photos` (body = `{ photos: string[] }`, max 3 URLs triées par ordre).

---

## 5. Gestion des erreurs & UX

- `400` : validations (âge < 18, bio trop longue, etc.) → afficher feedback contextualisé.
- `401` : jeton manquant/invalide (`draftToken` ou session expirée) → réauth.
- `404` : draft expiré → repartir au début et purger stockage local.
- `503` (presign) : configuration R2 absente → proposer un retry.

---

## 6. Bonnes pratiques côté client

- Encapsuler les requêtes dans un `OnboardingDraftService` unique : gère deviceId, tokens, merge local.
- Déclencher un `GET /onboarding/drafts/:deviceId` au lancement si `draftToken` connu pour restaurer l’état.
- Après merge login → effacer `draftId` & `draftToken` du stockage.
- Préparer des transformations pour convertir les contrôles UI (DatePicker, sliders, chips) vers les DTO exacts (strings ISO, arrays, etc.).

---

## 7. Types utiles (TypeScript)

```ts
type Gender = "male" | "female" | "non_binary" | "other" | "prefer_not_to_say";

type OnboardingDraftPayload = {
	profile?: {
		firstName?: string;
		birthdate?: string;
		gender?: Gender;
		seeking?: Gender[];
		intention?: string;
		city?: string;
		country?: string;
		lat?: number;
		lng?: number;
		bio?: string;
	};
	preferences?: {
		ageMin: number;
		ageMax: number;
		distanceKm: number;
	};
	interests?: string[];
	photos?: string[];
};

type DraftState = {
	deviceId: string;
	draftId: string;
	draftToken: string;
	expiresAt: string;
	payload: OnboardingDraftPayload;
};
```

---

## 8. Checklist Frontend

- [ ] Générer / persister `deviceId`.
- [ ] Implémenter wrapper API pour `POST/GET /onboarding/drafts`.
- [ ] Implémenter étapes `profiles/draft*`.
- [ ] Gérer upload R2 (presign → PUT → update draft).
- [ ] Intégrer paramètres `draftId`/`draftToken` dans l’auth provider.
- [ ] Après login : rafraîchir `/users/me/profile`, purger le draft, pousser l’utilisateur vers l’écran “Welcome + date du 1er match”.

Ce fichier évoluera en parallèle des ajustements backend (merge draft ↔ auth). Gardez un œil sur la doc Swagger quand le wiring auth sera livré pour valider les champs finaux.
