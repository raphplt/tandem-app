# Tandem Onboarding (Expo) — Implementation Notes

## Aperçu

Ce dossier décrit la nouvelle expérience d'onboarding **sans authentification initiale**. L'utilisateur complète l'intégralité du flow, nourrit un brouillon persistant (AsyncStorage + backend), puis relie ce brouillon à son compte lors de l'étape `AuthGate`.

- **Stack** : Expo Router, NativeWind, Gluestack UI, Zustand, React Query.
- **Design tokens** : classes Tailwind (`font-heading`, `font-body`, `accentGold`, `accentRose`, `bg-primary-*`).
- **Persistance draft** : `hooks/use-onboarding-draft` + `lib/onboarding/service`.
- **Upload photos** : `hooks/use-presign-upload` (presign PUT Cloudflare R2).
- **Analytics** : `hooks/use-onboarding-analytics` (PostHog).

## Flow & Navigation

```
IntroValues → FirstName → GenderSeeking → Birthdate → Location →
PrefsAgeDistance → Interests → Photos → Bio → AuthGate → Welcome → HomeGate → Tabs
```

Chaque écran est implémenté dans `app/(onboarding)/*.tsx` et consomme `OnboardingShell` + `OnboardingGradientButton` via `components/onboarding/*` pour garantir la cohérence visuelle. Les validations sont centralisées dans `src/lib/validations/onboarding.ts`.

`HomeGate` déclenche `useMyProfile()` après authentification, nettoie le store Zustand et redirige automatiquement vers `/(tabs)` dès que le profil fusionné est disponible.

## Pré-requis & lancement

1. **Dépendances** : `npm install` (Expo 54). Vérifier que `expo-image-picker`, `expo-file-system`, `expo-image`, `expo-linear-gradient` sont correctement autolinked.
2. **Env** : renseigner `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_AUTH_BASE_URL`, `EXPO_PUBLIC_APP_SCHEME` dans `app.json` / `.env` si besoin. Les appels brouillon reposent sur `/api/v1/onboarding/*`, `/profiles/draft*`, `/media/presign`.
3. **Fonts** : `Fraunces` & `Plus Jakarta Sans` sont chargées via Expo (voir `app/_layout.tsx` et `global.css`).
4. **Lancement** : `npx expo start`. L’entrée `app/index.tsx` redirige vers le flow d’onboarding ou les tabs selon la session et la complétion profil.

## Points d’attention

- **Auth providers** : l’écran `AuthGate` prépare le câblage (`draftId`/`draftToken` transmis à `/(auth)/sign-in` & `sign-up`). Les boutons Apple / Google / Phone affichent aujourd’hui un message “Bientôt” en attendant l’intégration Expo Auth Session + endpoints dédiés.
- **Merge draft** : les appels `signIn`/`signUp` transmettent optionnellement `draftId` & `draftToken`; côté backend prévoir la fusion via `/auth/{provider}` comme décrit dans `docs/onboarding-frontend.md`.
- **Uploads** : `use-presign-upload` enchaîne presign → PUT (expo-file-system) → update draft API. Les états `uploading` / `error` sont gérés dans l’UI `Photos`.
- **Analytics** : `useOnboardingStep` + `useOnboardingAnalytics` traquent `onboarding_step_view` / `onboarding_continue`; `AuthGate` envoie `auth_success` sur détection de session.
- **Localisation** : chaque étape enregistre immédiatement le brouillon (`saveDraft`) pour permettre la reprise.

## Vérifications & QA

| Vérification | Commande / Action |
|--------------|-------------------|
| Type check   | `npx tsc --noEmit` *(actuellement bloqué par l’erreur Node `Cannot find module 'node:path'` sur l’environnement local)* |
| i18n         | `npm run i18n:extract && npm run i18n:compile` pour synchroniser les nouvelles clés `Trans` |
| Expo         | `npm run start` puis tester le flow complet (reprise après kill d’app, upload R2, erreurs réseau) |

Tests manuels recommandés :
- Reprise d’onboarding après redémarrage (AsyncStorage + `GET /onboarding/drafts/:deviceId`).
- Upload photo hors ligne → toast d’erreur + retry.
- Validation âge < 18, distance hors bornes, bio trop courte.
- Auth e-mail avec brouillon existant → vérifier fusion côté backend (profil disponible dans `useMyProfile`).

## Capture & communication

- **Diff** : `git status` listant `app/(onboarding)/*`, nouveaux hooks et composants, suppression des anciens `profile-step-*`.
- **Vidéo** : enregistrer un run end-to-end (add photo → bio → auth → welcome → tabs) une fois les endpoints dispo.
- **Suivi** : check-list vivante dans `docs/onboarding-todo.md`.

## Suivi des gaps

- Implémenter les parcours **Apple / Google / Phone OTP** avec `expo-auth-session`, gestion des callbacks et fusion draft automatique.
- Exposer un endpoint backend dédié à la fusion post-auth si nécessaire (ou enrichir `/auth/login` / `/auth/register`).
- Ajouter des tests e2e Detox une fois le flow stabilisé.
- Mettre à jour les locales (`messages.po`) après extraction.
