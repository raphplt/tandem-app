import type { ProfileResponseDto } from "@/types/profile";

export enum MatchStatus {
	PENDING = "pending",
	ACCEPTED = "accepted",
	REJECTED = "rejected",
	EXPIRED = "expired",
	CANCELLED = "cancelled",
}

export enum MatchType {
	DAILY = "daily",
	MANUAL = "manual",
	PREMIUM = "premium",
}

export interface MatchCompatibilityBreakdown {
	ageCompatibility: number;
	locationCompatibility: number;
	interestCompatibility: number;
	valueCompatibility: number;
	responseRateBonus: number;
	activityBonus: number;
	verificationBonus: number;
}

export type MatchProfileSnapshot = Pick<
	ProfileResponseDto,
	| "id"
	| "firstName"
	| "bio"
	| "age"
	| "city"
	| "country"
	| "photoUrl"
	| "interestedIn"
> & {
	values?: string[];
	interests?: string[];
	mood?: string;
};

export interface MatchResponse {
	id: string;
	user1Id: string;
	user2Id: string;
	profile1Id: string;
	profile2Id: string;
	status: MatchStatus;
	type: MatchType;
	compatibilityScore: number;
	scoringBreakdown?: MatchCompatibilityBreakdown;
	matchDate: string;
	expiresAt?: string;
	acceptedAt?: string;
	user1AcceptedAt?: string;
	user2AcceptedAt?: string;
	rejectedAt?: string;
	user1RejectedAt?: string;
	user2RejectedAt?: string;
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
	isExpired: boolean;
	isPending: boolean;
	isAccepted: boolean;
	isRejected: boolean;
	daysSinceMatch: number;
	timeUntilExpiry?: number;
	profile1?: MatchProfileSnapshot;
	profile2?: MatchProfileSnapshot;
}

export interface AcceptMatchPayload {
	matchId: string;
}

export interface RejectMatchPayload {
	matchId: string;
	reason?: string;
}

