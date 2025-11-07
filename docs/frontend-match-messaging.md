# Guide API Match & Messages (frontend Expo)

## Authentification & formats

- Toutes les routes REST exposées ici utilisent `AuthGuard` (session BetterAuth). Le client Expo doit envoyer les cookies de session, ou le header `Authorization: Bearer <token>` si configuré côté BetterAuth.
- Les routes `matches` sont protégées par `RolesGuard` avec le rôle `admin`. Pour un usage utilisateur, de nouveaux endpoints devront être ajoutés ou un proxy doit être prévu.
- Les routes `messages` utilisent `OwnershipGuard` : l'utilisateur connecté doit être membre de la conversation associée.
- Toutes les dates sont renvoyées en ISO 8601 (`string` côté HTTP). Les nombres décimaux (`compatibilityScore`) sont sérialisés en chaîne JSON.

## Système de match

### Entités & enums (src/matches/entities/match.entity.ts)

```ts
export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum MatchType {
  DAILY = 'daily',
  MANUAL = 'manual',
  PREMIUM = 'premium',
}

export interface MatchResponse {
  id: string;
  user1Id: string;
  user2Id: string;
  profile1Id: string;
  profile2Id: string;
  status: MatchStatus;
  type: MatchType;
  compatibilityScore: number; // 0-100
  scoringBreakdown?: {
    ageCompatibility: number;
    locationCompatibility: number;
    interestCompatibility: number;
    valueCompatibility: number;
    responseRateBonus: number;
    activityBonus: number;
    verificationBonus: number;
  };
  matchDate: string; // date uniquement (UTC)
  expiresAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  expiredAt?: string;
  isActive: boolean;
  isMutual: boolean;
  metadata?: Record<string, unknown> & {
    matchingAlgorithm?: string;
    matchingVersion?: string;
    timezoneOffset?: number;
    user1Preferences?: unknown;
    user2Preferences?: unknown;
  };
  createdAt: string;
  updatedAt: string;
  // champs dérivés exposés par l'entity getter
  isExpired: boolean;
  isPending: boolean;
  isAccepted: boolean;
  isRejected: boolean;
  daysSinceMatch: number;
  timeUntilExpiry?: number; // heures restantes
}
```

`CreateMatchDto` reprend les champs `user*Id`, `profile*Id`, `matchDate`, accepte `status`, `type`, `compatibilityScore`, `scoringBreakdown`, `expiresAt`, `metadata`. `UpdateMatchDto` est un `Partial<CreateMatchDto>`.

### Logique métier notable (MatchesService)

- Limite : 1 match quotidien par utilisateur (`MAX_DAILY_MATCHES`).
- Expiration par défaut : `MATCH_EXPIRY_HOURS = 24` à partir de la création.
- Score de compatibilité minimal pour créer un match : `60`.
- Méthodes disponibles côté service pour la suite du produit (à exposer via routes dédiées) :
  - `findByUserId(userId)` : liste des matches actifs d'un utilisateur.
  - `findDailyMatch(userId, date)` : match quotidien pour une date.
  - `acceptMatch(id, userId)`, `rejectMatch(id, userId)`, `cancelMatch(id, userId)` : cycle de vie utilisateur.
  - `generateDailyMatches(date)` : match-making batch simple.

### Endpoints REST existants (`src/matches/matches.controller.ts`)

| Méthode | Route | Auth | Body | Réponse |
| --- | --- | --- | --- | --- |
| POST | `/matches` | Admin uniquement | `CreateMatchDto` | `MatchResponse` |
| GET | `/matches` | Admin uniquement | — | `MatchResponse[]` (actifs) |
| GET | `/matches/:id` | Admin uniquement | — | `MatchResponse` |
| PATCH | `/matches/:id` | Admin uniquement | `UpdateMatchDto` | `MatchResponse` |
| DELETE | `/matches/:id` | Admin uniquement | — | `204 No Content` (soft delete `isActive=false`) |

> ⚠️ Pour un front utilisateur, prévoir d'exposer au moins : liste des matches de l'utilisateur courant, accept/reject, récupération d'un match quotidien.

## Système de conversations & messages

### Enums & entités clés

```ts
// src/conversations/entities/conversation.entity.ts
enum ConversationStatus { ACTIVE='active', EXPIRED='expired', CLOSED='closed', ARCHIVED='archived' }
enum ConversationType { DAILY='daily', EXTENDED='extended', PREMIUM='premium' }

export interface ConversationResponse {
  id: string;
  user1Id: string;
  user2Id: string;
  matchId: string;
  status: ConversationStatus;
  type: ConversationType;
  startTime: string;
  expiresAt: string;
  extendedAt?: string;
  closedAt?: string;
  archivedAt?: string;
  isActive: boolean;
  isReadByUser1: boolean;
  isReadByUser2: boolean;
  lastMessageAt?: string;
  messageCount: number;
  metadata?: {
    timezoneOffset?: number;
    extensionCount?: number;
    lastActivity?: string;
    user1LastSeen?: string;
    user2LastSeen?: string;
  };
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isActiveConversation: boolean;
  timeUntilExpiry: number; // heures restantes
  duration: number; // heures depuis startTime
  canBeExtended: boolean; // <2h restantes et conversation daily active
  hasUnreadMessages: boolean;
}
```

```ts
// src/messages/entities/message.entity.ts
enum MessageType { TEXT='text', IMAGE='image', EMOJI='emoji', SYSTEM='system' }
enum MessageStatus { SENT='sent', DELIVERED='delivered', READ='read', FAILED='failed' }

export interface MessageResponse {
  id: string;
  authorId: string;
  conversationId: string;
  content: string; // '[Message deleted]' si supprimé
  type: MessageType;
  status: MessageStatus;
  replyToId?: string;
  editedAt?: string;
  deletedAt?: string;
  isDeleted: boolean;
  isEdited: boolean;
  metadata?: {
    fileUrl?: string;
    fileSize?: number;
    fileType?: string;
    thumbnailUrl?: string;
    emoji?: string;
    systemMessage?: string;
    deliveryAttempts?: number;
    lastDeliveryAttempt?: string;
  };
  createdAt: string;
  updatedAt: string;
  isSystemMessage: boolean; // dérivé du type
  isMediaMessage: boolean;
  isEmojiMessage: boolean;
  ageInMinutes: number;
  ageInHours: number;
  ageInDays: number;
  formattedAge: string; // ex: '30m ago'
}
```

`CreateMessageDto` impose :

- `content` min 1 / max 2000 caractères.
- `conversationId` obligatoire.
- `type` par défaut `text`.
- `metadata` requis selon le type (`fileUrl` pour image, `emoji` pour emoji).

`UpdateMessageDto` est un `Partial<CreateMessageDto>`. L'édition est possible < 5 minutes après envoi et si le message n'est pas supprimé.

### Endpoints REST disponibles (`src/messages/messages.controller.ts`)

| Méthode | Route | Query | Body | Retour | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/messages` | — | `CreateMessageDto` | `MessageResponse` | L'utilisateur connecté devient `authorId`. Rejette si conversation inactive. |
| GET | `/messages` | `conversationId` (obligatoire), `limit` (<=100, défaut 50), `offset` (>=0) | — | `MessageResponse[]` ordonnés desc (dernier en premier) | Vérifie que l'utilisateur est membre de la conversation. |
| GET | `/messages/:id` | — | — | `MessageResponse` | Accès réservé à l'auteur ou à un participant via OwnershipGuard. |
| PATCH | `/messages/:id` | — | `UpdateMessageDto` | `MessageResponse` | Autorisé uniquement à l'auteur, < 5 min, message non supprimé. |
| DELETE | `/messages/:id` | — | — | `MessageResponse` | Soft delete : `content` devient `"[Message deleted]"`. |

Fonctions supplémentaires côté service auxquelles raccorder le front :

- `markConversationAsRead(conversationId, userId)` (déjà appelé via WS `message.read`).
- `searchMessages(query, userId, conversationId?, limit?)` pour recherche texte.
- `getUnreadCount(userId)` & `getUnreadCountForConversation(conversationId, userId)`.

> ⚠️ Les endpoints `conversations` existants sont actuellement limités au rôle `admin`. Prévoir une route utilisateur pour lister les conversations actives (`findByUserId`) et pour prolonger / fermer (`extendConversation`, `closeConversation`, `archiveConversation`, `markAsRead`).

## WebSocket temps-réel (Socket.IO namespace `/chat`)

### Connexion

- URL : `wss://<host>/chat` (Socket.IO v4).
- Auth : même session BetterAuth. Le garde `WsAuthGuard` lit les headers du handshake (`Authorization`, cookies...).
- CORS autorisé selon `app.corsOrigin` (fallback `http://localhost:3000`).

### Événements émis par le client

| Event | Payload | Effet |
| --- | --- | --- |
| `conversation.join` | `{ conversationId: string }` | Rejoint la room Socket.IO de la conversation après vérification d'appartenance. |
| `conversation.leave` | `{ conversationId: string }` | Quitte la room. |
| `message.send` | `CreateMessageDto` | Crée un message. Retour `{ status: 'ok', message: MessageResponse }`. Rejoint automatiquement la room si pas déjà membre. |
| `message.update` | `{ messageId: string; update: UpdateMessageDto }` | Met à jour un message (mêmes règles que REST). Retour `{ status: 'ok', message: MessageResponse }`. |
| `message.delete` | `{ messageId: string }` | Supprime un message (soft delete). Retour `{ status: 'ok', message: MessageResponse }`. |
| `message.read` | `{ conversationId: string }` | Marque la conversation comme lue pour l'utilisateur courant. Retour `{ status: 'ok', conversationId }`. |

Les payloads sont validés côté serveur via `ValidationPipe` (whitelist + transformation), donc envoyer uniquement les champs déclarés.

### Événements reçus du serveur

| Event | Payload | Description |
| --- | --- | --- |
| `message.new` | `MessageResponse` | Diffusé à toute la room sur la création. Le statut est promu à `delivered` et `MessagesService.markAsDelivered` est déclenché côté serveur. |
| `message.updated` | `MessageResponse` | Diffusé lors d'une édition. |
| `message.deleted` | `MessageResponse` | Diffusé lors d'une suppression (contient `isDeleted=true`, `content='[Message deleted]'`). |
| `message.read` | `{ conversationId: string; userId: string; unreadCount: number }` | Notifie les participants qu'un utilisateur a tout lu. |

### Séquence type côté client

1. Une fois authentifié, instancier `io('/chat', { withCredentials: true, extraHeaders: { Authorization: 'Bearer ...' }})`.
2. Pour chaque conversation à afficher, appeler `socket.emit('conversation.join', { conversationId })`.
3. Charger l'historique via `GET /messages?conversationId=...`.
4. Sur envoi d'un message :

   ```ts
   socket.emit('message.send', { conversationId, content, type, metadata }, (ack) => {
     if (ack.status === 'ok') {
       // ack.message contient le message normalisé
     }
   });
   ```

5. Écouter `message.new` pour alimenter le flux ; si l'auteur est l'utilisateur courant, fusionner avec l'état local pour éviter les doublons.
6. Lorsqu'un thread est lu, émettre `message.read` pour remettre le compteur à zéro.

### Rappels front

- Les messages sont retournés dans l'ordre décroissant (`createdAt DESC`) par la route `GET /messages`; inverser côté client si nécessaire.
- `metadata.deliveryAttempts` et `lastDeliveryAttempt` sont gérés serveur, ne pas surcharger côté client.
- Pour les messages média, prévoir un stockage S3/R2 et renseigner `metadata.fileUrl`, `metadata.fileType`, `metadata.thumbnailUrl` avant d'appeler `message.send`.
- Les messages système (`type='system'`) sont créés via `MessagesService.createSystemMessage` (pas exposé au front). Si besoin dans l'app, prévoir une API ou un event spécifique.

## Points d'attention pour la suite

- Exposer des routes utilisateur pour : accepter/refuser un match, lister les matches actifs, lister/étendre/clore les conversations.
- Ajouter des garde-fous côté API (`rate limiting`, validation `matchDate` vs timezone) avant mise en prod.
- Prévoir un mapping client pour afficher les `MatchStatus` et `MessageStatus` (ex: badge "En attente") et formater les durées (`timeUntilExpiry`).
- Si l'app Expo doit gérer la reconnexion Socket.IO, réémettre `conversation.join` après chaque reconnect.
