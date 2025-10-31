import { Gender, ProfileVisibility } from "./user";

// Types selon l'API documentée
export interface ProfileResponseDto {
	id: string;
	userId: string;
	bio: string;
	city: string;
	country?: string;
	age: number;
	gender: Gender;
	interestedIn: Gender[];
	photoUrl?: string;
	visibility: ProfileVisibility;
	isActive: boolean;
	isComplete: boolean;
	isVerified: boolean;
	preferences?: {
		ageRange?: { min: number; max: number };
		maxDistance?: number;
		interests?: string[];
		values?: string[];
	};
	socialLinks?: {
		instagram?: string;
		twitter?: string;
		linkedin?: string;
		website?: string;
	};
	location?: {
		latitude: number;
		longitude: number;
		city: string;
		country: string;
	};
	viewCount: number;
	likeCount: number;
	matchCount: number;
	createdAt: string;
	updatedAt: string;
	isProfileComplete: boolean;
	ageRange: { min: number; max: number };
	maxDistance: number;
}

export interface CreateProfileDto {
	bio: string; // 10-500 caractères (requis)
	city: string; // 2-100 caractères (requis)
	country?: string; // 2-100 caractères (optionnel)
	age: number; // 18-100 (requis)
	gender: Gender; // Enum (requis)
	interestedIn: Gender[]; // Array (requis, minimum 1)
	photoUrl?: string; // URL valide (optionnel)
	visibility?: ProfileVisibility; // Enum (optionnel, défaut: PUBLIC)
	preferences?: {
		ageRange?: { min: number; max: number };
		maxDistance?: number; // 1-1000 km
		interests?: string[]; // Liste de noms d'intérêts (strings)
		values?: string[];
	};
	socialLinks?: {
		instagram?: string;
		twitter?: string;
		linkedin?: string;
		website?: string;
	};
	location?: {
		latitude: number;
		longitude: number;
		city: string;
		country: string;
	};
}

export type UpdateProfileDto = Partial<CreateProfileDto>;

