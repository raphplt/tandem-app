import { Profile } from "./user";

export enum ConversationStatus {
	ACTIVE = "active",
	EXPIRED = "expired",
	CLOSED = "closed",
	ARCHIVED = "archived",
}

export enum ConversationType {
	DAILY = "daily",
	EXTENDED = "extended",
	PREMIUM = "premium",
}

export interface ConversationMetadata {
	timezoneOffset?: number;
	extensionCount?: number;
	lastActivity?: string;
	profile1: Profile;
	profile2: Profile;
}

export interface ConversationResponse {
	id: string;
	user1Id: string;
	user2Id: string;
	profile1: Profile;
	profile2: Profile;
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
	metadata?: ConversationMetadata;
	createdAt: string;
	updatedAt: string;
	isExpired: boolean;
	isActiveConversation: boolean;
	timeUntilExpiry: number;
	duration: number;
	canBeExtended: boolean;
	hasUnreadMessages: boolean;
}
