# 🌿 Solow — Application mobile de “slow social”

## 🧩 Concept

Solow est une application sociale qui recrée la profondeur des échanges humains.  
Chaque jour, un utilisateur ne peut parler **qu’à une seule personne**, choisie selon ses affinités et son humeur.  
La discussion dure **24 heures**, puis disparaît sauf si les deux souhaitent la poursuivre.

> **Philosophie :** moins de bruit, plus de vrai.

---

## 📲 Pages principales

### **1. Écran d’accueil / Journée**
**Objectif :** point d’entrée quotidien — le cœur du rituel.  
**Éléments clés :**
- Message d’accueil personnalisé.  
- Bouton “Lancer un match”.  
- Compteur avant prochain créneau (si déjà matché).  
- Résumé succinct de progression (streak, badges…).  
- Statut du jour : disponible / en attente / en conversation.  

**Transitions :**  
→ Vers Matching / Conversation une fois la journée lancée.  
→ Vers Profil pour modifier les préférences.

---

### **2. Page de Matching**
**Objectif :** moment de connexion émotionnelle et d’attente.  
**Éléments clés :**
- Animation de recherche apaisante.  
- Citation ou phrase calme pendant l’attente.  
- Révélation du match avec carte : prénom, âge, tags, bio.  
- Bouton “Commencer à discuter”.  

**Transition :** → Vers Chat.

---

### **3. Page de Conversation (Chat 24 h)**
**Objectif :** espace unique d’échange humain.  
**Éléments clés :**
- En-tête avec photo, prénom, timer 24 h.  
- Chat fluide et clair.  
- Brise-glace automatique (question du jour / mini-jeu).  
- Réactions, likes, réponses rapides.  
- Message de fin “Souhaitez-vous continuer ?” (double validation).  

**Transitions :**  
→ Retour Accueil (fin de session).  
→ Enregistrement prolongation (Premium ou mutuel).

---

### **4. Page de Résumé / Fin de Journée**
**Objectif :** clore la journée et valoriser l’expérience.  
**Éléments clés :**
- Message de clôture personnalisé.  
- Statistiques symboliques (durée, compatibilité).  
- Champ “Ce que j’ai retenu”.  
- Option rappel pour le lendemain.  

---

### **5. Page Profil**
**Objectif :** ancrage identitaire et réglages personnels.  
**Éléments clés :**
- Photo (optionnelle), prénom, bio courte.  
- Intérêts, valeurs, humeur du jour.  
- Paramètres : mode (amitié / rencontre douce), historique, fuseau horaire, langue.  
- Streak et badges symboliques.  

---

### **6. Page Notifications / Activité**
**Objectif :** regrouper rappels, badges et événements.  
**Éléments clés :**
- Rappels (match disponible, expiration).  
- Récompenses débloquées.  
- Messages de l’équipe.  
- Historique des matches.  

---

### **7. Page Communauté (V2+)**
**Objectif :** prolonger la philosophie sans saturation.  
**Éléments clés :**
- Groupes affinitaires (lecture, introspection…).  
- Citation collective du jour.  
- Témoignages anonymisés.  

---

### **8. Page Paramètres / Compte**
**Objectif :** gérer sécurité, confidentialité et abonnement.  
**Éléments clés :**
- Compte : email, connexion, déconnexion.  
- Confidentialité : suppression, consentement.  
- Notifications push/email.  
- Abonnement Premium (V2+).  
- Aide et mentions légales.  

---

### **9. Page Premium (V2+)**
**Objectif :** présenter les avantages sans pression.  
**Éléments clés :**
- Prolonger les conversations, filtres d’affinité.  
- Tarification claire et CTA sobre.  

---

### **10. Page Bienvenue / Onboarding**
**Objectif :** installer le cadre psychologique dès l’ouverture.  
**Éléments clés :**
- 3–4 écrans illustrés : “Une seule conversation par jour”, “Pas de swipes, pas de pub”…  
- Sélection rapide d’intérêts et intentions.  
- Confirmation par email / code.  

---

## 🧠 Fonctionnalités (par version)

### **Version 0 — POC**
- Inscription simple.  
- Matching manuel ou semi-auto.  
- Chat texte limité à 24 h.  
- Suppression automatique à minuit.  

### **Version 1 — MVP public**
- Onboarding en 3 étapes.  
- Matching affinitaire et timezone.  
- Brise-glace automatique.  
- Notifications push.  
- Anti-ghosting, badges symboliques, feedback in-app.  

### **Version 2 — Lancement public**
- Profil complet et intentions.  
- Historique optionnel, modération renforcée.  
- Système de réputation et analytics internes.  
- Refonte UX / UI.  

### **Version 3 — Premium**
- Prolongation de chat, historique complet, filtres avancés.  
- Programme ambassadeur.  
- IA : détection de toxicité, suggestions de questions.  

### **Version 4 — Internationale**
- Multilingue complet.  
- Communautés d’intérêts.  
- Partenariats et événements IRL.  

### **Version 5 — Long terme**
- Journal personnel (“Mon Journal Solow”).  
- Mode bien-être numérique.  
- Intégrations Spotify / Notion / Strava.  
- Programme “Solow Impact”.  

---

## ⚙️ Stack technique

### **App Mobile**
- Expo / React Native / TypeScript  
- Navigation : Expo Router, React Navigation  
- UI : Tailwind CSS, NativeWind, Gluestack UI  
- State & data : Zustand, React Query  
- Auth : Better Auth (Expo Secure Store)  
- Stockage : MMKV, AsyncStorage  
- Temps réel : Socket.io Client  
- Analytics : PostHog  
- i18n : Lingui, i18next  
- Animations : Legend Motion, Reanimated  
- Notifications, images, gradients via modules Expo  

---

### **API / Backend**
- NestJS (TypeScript) + Express  
- PostgreSQL + TypeORM  
- Redis + BullMQ (cache & queues)  
- Socket.IO pour le temps réel  
- Better Auth pour l’authentification  
- Firebase Admin pour notifications  
- Sentry / OpenTelemetry / Jaeger pour le monitoring  
- Swagger/OpenAPI pour la documentation  
- Modules principaux : Auth, Users, Profiles, Matches, Conversations, Messages, Notifications, Rewards, Reports, Analytics  
- Docker-compose (PostgreSQL, Redis, Jaeger)  
