export enum InterestCategory {
	SPORTS = "sports",
	MUSIC = "music",
	ARTS = "arts",
	TRAVEL = "travel",
	FOOD = "food",
	TECHNOLOGY = "technology",
	HEALTH = "health",
	EDUCATION = "education",
	BUSINESS = "business",
	ENTERTAINMENT = "entertainment",
	LIFESTYLE = "lifestyle",
	OTHER = "other",
}

export interface InterestResponseDto {
	id: string;
	name: string;
	description?: string;
	category: InterestCategory;
	icon?: string;
	color?: string;
	isActive: boolean;
	profileCount: number;
	popularityScore: number;
	tags: string[];
	metadata?: {
		relatedInterests?: string[];
		keywords?: string[];
		searchWeight?: number;
		displayOrder?: number;
	};
	createdAt: string;
	updatedAt: string;
	isPopular: boolean; // Calculé (popularityScore > 50)
	isTrending: boolean; // Calculé (popularityScore > 100)
	displayName: string; // Calculé (= name)
	searchableText: string; // Calculé (name + description + tags)
}

export interface CreateInterestDto {
	name: string; // 2-50 caractères (requis, unique)
	description?: string; // Max 500 caractères (optionnel)
	category: InterestCategory; // Enum (requis)
	icon?: string; // Max 10 caractères (optionnel)
	color?: string; // Max 20 caractères (optionnel)
	tags?: string[]; // Max 10 tags (optionnel)
	metadata?: {
		relatedInterests?: string[];
		keywords?: string[];
		searchWeight?: number;
		displayOrder?: number;
	};
}

