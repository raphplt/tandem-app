# 🧠 Prompt — Implémentation Onboarding + Profil Tandem (V1)

## 🎯 Objectif

Implémenter **l’onboarding complet** et la **création du profil minimaliste** pour l’application **Tandem**, selon les principes de simplicité, lenteur sociale et authenticité.

---

## ⚙️ Contexte technique

* **Framework :** Expo (React Native 0.81.5)
* **Langage :** TypeScript
* **Navigation :** Expo Router + React Navigation
* **UI :** Tailwind via NativeWind + Gluestack UI
* **State management :** Zustand
* **Requêtes :** React Query
* **Validation :** Zod
* **Animations :** Legend Motion / Reanimated
* **Backend :** API NestJS (endpoint `/profiles`, `/auth/register`)
* **Auth :** Better Auth + Secure Store

---

## 📱 Écrans à créer

### **1. Welcome / Introduction**

* Objectif : installer le ton Tandem et expliquer la philosophie.
* 3 écrans à faire défiler (horizontal swipe ou auto-carousel) :

  1. “Une seule conversation par jour.”
  2. “Pas de swipe, pas de pub.”
  3. “Juste des gens réels, comme toi.”
* Bouton “Commencer” à la fin.
* Transitions douces (`fadeIn`, `slide`).

---

### **2. Création du compte**

* Utiliser le flux déjà existant d’inscription (email + mot de passe).
* Si compte déjà créé → passer directement à l’écran suivant.
* Si nouveau compte → après validation, passer à la saisie du profil.

---

### **3. Profil – Étape 1 : identité**

* Champs :

  * `firstName` (texte, obligatoire)
  * `age` (sélecteur ou champ numérique, obligatoire)
* Validation via Zod.
* Bouton “Continuer”.

---

### **4. Profil – Étape 2 : centres d’intérêt**

* Objectif : recueillir 3 à 5 centres d’intérêt principaux.
* Présentation : grille de tags pré-remplis (multi-select).

  * Exemples : “Musique”, “Lecture”, “Voyage”, “Création”, “Bien-être”, “Sport”, “Philosophie”, “Cinéma”.
* Limite : max 5.
* Bouton “Continuer” (désactivé si <3).

---

### **5. Profil – Étape 3 : mini-bio**

* Champ texte limité à 100 caractères.
* Placeholder :

  * “Ce qui me rend curieux…”
  * “Je me sens moi-même quand…”
  * “J’aime rencontrer des gens qui…”
* Bouton “Continuer”.

---

### **6. Profil – Étape 4 : photo (optionnelle)**

* Option 1 : “Importer une photo” via `expo-image-picker`.
* Option 2 : “Générer un avatar abstrait” (initiales + couleur aléatoire).
* Possibilité de “Passer cette étape”.
* Bouton “Terminer”.

---

### **7. Écran final – Confirmation**

* Message central :
  *“Bienvenue sur Tandem 🌿”*
  *“Ton premier match est disponible maintenant.”*
* Bouton CTA : “Découvrir ma rencontre”.
* Transition → redirection vers `/home` (écran d’accueil du jour).

---

## 💾 Stockage & backend

* Stockage temporaire des données du profil via Zustand.
* Validation finale puis POST vers `/api/v1/profiles` :

  ```ts
  {
    firstName: string,
    age: number,
    interests: string[],
    bio?: string,
    avatarUrl?: string
  }
  ```
* En cas d’erreur → toast Gluestack + retry.

---

## 💡 UX Guidelines

* Aucune surcharge visuelle.
* Espacement généreux, fond clair, dégradé léger bleu-violacé.
* Typo sobre (Inter ou Manrope).
* Petites animations haptique sur validation (`expo-haptics`).
* Barre de progression discrète sur les étapes du profil (4 étapes).

---

## 🧩 Bonus (non prioritaire pour MVP)

Préparer les hooks pour ces futurs ajouts :

* `useIntentSelection()` (mode amitié / rencontre douce)
* `useValuesSelection()` (valeurs humaines)
* `useOnboardingProgress()` (persist progress localement)
  Mais **ne pas les afficher dans la V1**.

---

## ✅ Résultat attendu

À la fin du flux :

* L’utilisateur arrive sur `/home` avec son profil complet.
* Son profil est enregistré côté API et accessible via `GET /profiles/me`.
* L’UX doit être fluide, apaisée, cohérente avec l’esprit “slow social”.

---

Souhaites-tu que je te fasse maintenant une **V2 du prompt** avec les **textes exacts à afficher dans chaque écran (UX writing complet)** pour le rendre prêt à injecter dans le code ?
