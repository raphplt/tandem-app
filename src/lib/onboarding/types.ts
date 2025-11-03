import { Gender } from "@/types/user";

export type OnboardingStepKey =
	| "intro-values"
	| "first-name"
	| "gender-seeking"
	| "birthdate"
	| "location"
	| "prefs-age-distance"
	| "interests"
	| "photos"
	| "bio"
	| "auth-gate"
	| "auth-email"
	| "welcome"
	| "home-gate";

export type OnboardingCoordinates = {
	latitude: number;
	longitude: number;
};

export type OnboardingProfileDraft = {
	firstName?: string;
	birthdate?: string;
	gender?: Gender;
	seeking?: Gender[];
	intention?: string;
	city?: string;
	country?: string;
	coords?: OnboardingCoordinates;
	bio?: string;
};

export type OnboardingProfilePayload = Omit<
	OnboardingProfileDraft,
	"coords"
> & {
	lat?: number;
	lng?: number;
};

export type OnboardingPreferencesDraft = {
	ageMin?: number;
	ageMax?: number;
	distanceKm?: number;
};

export type OnboardingDraftPayload = {
	profile?: OnboardingProfilePayload;
	preferences?: OnboardingPreferencesDraft;
	interests?: string[];
	photos?: string[];
};

export type OnboardingDraftRecord = {
	deviceId: string;
	draftId: string;
	draftToken: string;
	expiresAt: string;
	payload: OnboardingDraftPayload;
};

export type DraftPhotoUploadStatus =
	| "idle"
	| "uploading"
	| "uploaded"
	| "error";

export type DraftPhoto = {
	id: string;
	localUri?: string;
	remoteUrl?: string;
	contentType?: string;
	status: DraftPhotoUploadStatus;
	errorMessage?: string;
	uploadedAt?: string;
};

export type PresignUploadScope = "photos/profile";

export type PresignUploadResponse = {
	url: string;
	key: string;
	publicUrl?: string;
	expiresIn?: number;
};
