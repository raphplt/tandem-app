# Flux SSE « Recherche quotidienne » — État actuel & incident

## Contexte frontend

- **Hook** `useDailySearchStream` (`src/hooks/use-daily-search-stream.ts`)  
  - Ouvre un `EventSource` (package `react-native-sse`) sur `GET ${env.baseURL}/api/v1/matches/search/stream` avec header `Authorization: Bearer <sessionToken>`.  
  - À l’appui sur “Lancer ma rencontre”, le front :  
    1. `POST /api/v1/availability/queue/join`  
    2. `POST /api/v1/availability/heartbeat` (immédiat puis toutes les 2 min)  
    3. Ouvre le flux SSE et passe l’état `isSearching=true`.  
  - Événements consommés : `search_state`, `match_found`, `heartbeat` (cf. `handleStreamEvent` lignes ~178‑214).  
  - Sur `match_found`, on arrête la recherche, on invalide les requêtes React Query `["matches","daily"]` et le match remonte dans l’écran d’accueil sans reload manuel.
- **UI** `HomeScreen` (`app/(tabs)/index.tsx`)  
  - Affiche la carte “Recherche en cours” tant que `isSearching` est vrai.  
  - Les logs visibles côté app proviennent des callbacks `onOpen`/`onClose` (`"SSE stream connected"`).

## Comportement observé

- Lors d’une recherche, seuls les logs `DEBUG [match-search] SSE stream connected` apparaissent (répétés à chaque reconnexion). Aucun `search_state` ni `match_found` n’est loggé/parsé.
- En relançant l’app ou en faisant un refetch manuel (`useDailyMatch`), le match quotidien précédemment généré apparaît bien, ce qui confirme qu’il est stocké côté API mais jamais notifié via SSE.

## Preuves côté API

Extrait de logs fournis (10/11/2025 23:51):

```
POST /api/v1/availability/heartbeat 201
GET  /api/v1/matches/search/stream 200 (6ms)
GET  /api/v1/matches/search/stream 200 (15003ms)
...
[MatchmakingService] Created 1 daily matches from queue
GET  /api/v1/matches/search/stream 200 (15011ms)
GET  /api/v1/matches/search/stream 200 (30021ms)
```

→ On voit le matchmaking créer un match (**log Nest**), mais aucune payload n’est reçue côté front entre les multiples connexions SSE successives.

## Hypothèses

1. **Flux SSE n’émet pas les événements attendus** : la route `/matches/search/stream` retourne bien `200` mais n’envoie peut‑être pas de `event:` + `data:` avant de fermer. L’app ne reçoit donc que l’ouverture et reste en attente.
2. **Format/payload incompatible** : si le backend envoie un JSON ou un champ `data:` non terminé par `\n\n`, le parseur du package `react-native-sse` ne déclenche rien.
3. **Auth/filtrage serveur** : le flux pourrait filtrer les événements par utilisateur et ignorer le match créé (ex. mismatch d’id, attente d’un heartbeat spécifique, etc.).

## Besoin backend

Merci de vérifier côté API :

1. Que `GET /matches/search/stream` émet bien les événements `search_state`, `heartbeat` et surtout `match_found` pour l’utilisateur connecté (avec `Authorization: Bearer …`).  
2. Que chaque événement suit la spec SSE (`event: foo`, `data: {...}`, **ligne vide**).  
3. Ce qu’il se passe lorsque `MatchmakingService` crée un match `daily` : l’événement `match_found` est‑il réellement publié ? Y a‑t‑il des conditions supplémentaires (ex. `isOnline`, `queuedAt` non nul) ?

Une fois le flux confirmé côté backend, le front est prêt à consommer immédiatement (les gestionnaires sont déjà implémentés). Toute trace ou payload brute envoyée par `/matches/search/stream` nous aiderait à reproduire.
