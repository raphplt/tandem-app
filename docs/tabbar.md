# Guide : Créer une tab bar moderne et esthétique dans une app Expo / React Native

## 1. Objectif

Créer une **tab bar flottante, moderne et fluide**, intégrée à Expo Router et React Native.  
Le design met l’accent sur la **simplicité, le flou (glassmorphism)**, et une **action centrale proéminente** (ex. “Match”).

---

## 2. Composants et architecture

Structure recommandée du projet :

- **Expo Router** pour la navigation par onglets.
- **Tabs principales** : Accueil, Chat, (Bouton central), Profil.
- **Composant Tab Bar** personnalisé dans `/components/ui/CustomTabBar.tsx`.
- **BlurView** pour le fond flouté.
- **Haptics** pour un retour tactile doux sur chaque action.
- **Phosphor Icons** pour un style homogène et minimaliste.

---

## 3. Design de la tab bar

- **Flottante** : légère élévation (shadow), espacée du bas de l’écran.
- **Effet blur** : fond semi-transparent pour un rendu “glassmorphism”.
- **Coins arrondis** : radius 24px pour un rendu doux et moderne.
- **Bouton central (FAB)** : rond, légèrement plus grand, coloré à la couleur de marque.
- **Icônes animées** : légère translation verticale et variation d’opacité au focus.
- **Labels** : petits (11px), opacité 0.7 → 1 au focus.

---

## 4. Expérience utilisateur (UX)

- **Safe-area** : adapter les marges avec `useSafeAreaInsets()`.
- **Retour haptique** : léger feedback à chaque clic.
- **Ripple Android** : effet de clic natif Android.
- **Transitions animées** : interpolation de la position et de l’opacité des icônes actives.
- **Accessibilité** : zones tactiles ≥ 44px, contraste suffisant.

---

## 5. Conseils visuels

- **Élévation** : ombre douce `y=8–12`, `radius=14–20`, `opacity≈0.18`.
- **Couleurs** : blanc semi-transparent sur fond clair, gris foncé translucide sur fond sombre.
- **Accent central** : bouton “Match” ou “+” lumineux, ombré, centré verticalement.
- **Police** : sans-serif lisible, légère mise en gras sur l’onglet actif.
- **Dark mode** : teinte `tint="dark"` pour le `BlurView` + `rgba(18,18,18,0.6)` pour le fond.

---

## 6. Variantes possibles

- **Material 3** : remplacer le `BlurView` par un fond opaque semi-translucide avec une bordure subtile.
- **Pill animé** : ajouter un petit indicateur (barre ovale) sous l’icône active, animé horizontalement.
- **Version Tailwind / NativeWind** : utiliser `className` pour gérer les styles directement.
- **Motion** : intégrer **Framer Motion** ou **Legend Motion** pour des transitions plus fluides.

---

## 7. Résumé

Une tab bar moderne doit :

- Être **simple, claire, intuitive et légère**.
- Offrir un **retour tactile et visuel** immédiat.
- S’intégrer harmonieusement à la marque et au style global de l’app.
- Prioriser **le bouton central** comme point d’action clé.
