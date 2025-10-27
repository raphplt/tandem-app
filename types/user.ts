export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	dateOfBirth?: string;
	roles?: UserRole[];
	isActive?: boolean;
	lastLoginAt?: string;
	lastLogoutAt?: string;
	createdAt?: string;
	updatedAt?: string;
	profile?: Profile;
}

export interface Profile {
	userId: string;
	bio?: string;
	city?: string;
	country?: string;
	age?: number;
	gender?: Gender;
	interestedIn?: Gender[];
	photoUrl?: string; //TODO : tableau d'images ?
	photoPublicId?: string;
	visibility?: ProfileVisibility;
	isActive?: boolean;
	isComplete?: boolean;
	isVerified?: boolean;
	preferences?: {
		ageRange?: { min: number; max: number };
		maxDistance?: number;
		interests?: string[];
		values?: string[];
	};
	socialLinks?: {
		instagram?: string;
		twitter?: string;
		youTube?: string;
		facebook?: string;
		spotify?: string;
		linkedin?: string;
		website?: string;
	};
	location?: {
		latitude: number;
		longitude: number;
		city: string;
		country: string;
	};
	viewCount?: number;
	likeCount?: number;
	matchCount?: number;
	createdAt?: string;
	updatedAt?: string;
	//TODO : à implementer
	// interests?: string[];
	// values?: string[];
}

// ENUMS

export const enum UserRole {
	ADMIN = "admin",
	USER = "user",
	MODERATOR = "moderator",
}

export enum Gender {
	MALE = "male",
	FEMALE = "female",
	NON_BINARY = "non_binary",
	OTHER = "other",
	PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum ProfileVisibility {
	PUBLIC = "public",
	FRIENDS_ONLY = "friends_only",
	PRIVATE = "private",
}
