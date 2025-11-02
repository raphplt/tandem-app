import { apiFetch } from "@/src/lib/api/client";
import { extractErrorMessage } from "@/src/utils/error";
import type {
	OnboardingDraftPayload,
	OnboardingDraftRecord,
	PresignUploadResponse,
} from "@/src/lib/onboarding/types";

const API_PREFIX = "/api/v1";

function normalizeErrorMessage(message: string | string[] | undefined) {
	if (!message) return "Unknown error";
	return Array.isArray(message) ? message.join(" • ") : message;
}

async function unwrap<T>(
	promise: Promise<{ data: T | null; error: unknown }>
): Promise<T> {
	const result = await promise;
	if ("error" in result && result.error) {
		if (typeof result.error === "object" && result.error !== null) {
			const maybeError = result.error as {
				message?: string | string[];
				statusCode?: number;
			};
			throw new Error(normalizeErrorMessage(maybeError.message));
		}
		throw new Error(extractErrorMessage(result.error));
	}
	if (!("data" in result) || result.data === null) {
		throw new Error("No data returned from API");
	}
	return result.data;
}

export async function fetchOnboardingDraft(params: {
	deviceId: string;
	draftToken?: string;
}) {
	const { deviceId, draftToken } = params;
	const endpoint = `${API_PREFIX}/onboarding/drafts/${deviceId}`;
	return unwrap<OnboardingDraftRecord>(
		apiFetch(endpoint, {
			skipAuth: true,
			method: "GET",
			headers: draftToken ? { "x-draft-token": draftToken } : undefined,
		})
	);
}

export async function saveOnboardingDraft(params: {
	deviceId: string;
	draftToken?: string;
	payload: OnboardingDraftPayload;
}) {
	const { deviceId, draftToken, payload } = params;

	return unwrap<OnboardingDraftRecord>(
		apiFetch(`${API_PREFIX}/onboarding/drafts`, {
			skipAuth: true,
			method: "POST",
			body: JSON.stringify({
				deviceId,
				draftToken,
				payload,
			}),
		})
	);
}

export async function updateProfileDraft(params: {
	draftId: string;
	draftToken: string;
	profile: NonNullable<OnboardingDraftPayload["profile"]>;
}) {
	const { draftId, draftToken, profile } = params;
	return unwrap<OnboardingDraftRecord>(
		apiFetch(`${API_PREFIX}/profiles/draft`, {
			skipAuth: true,
			method: "POST",
			body: JSON.stringify({
				draftId,
				draftToken,
				...profile,
			}),
		})
	);
}

export async function updatePreferencesDraft(params: {
	draftId: string;
	draftToken: string;
	preferences: NonNullable<OnboardingDraftPayload["preferences"]>;
}) {
	const { draftId, draftToken, preferences } = params;
	return unwrap<OnboardingDraftRecord>(
		apiFetch(`${API_PREFIX}/profiles/draft/preferences`, {
			skipAuth: true,
			method: "POST",
			body: JSON.stringify({
				draftId,
				draftToken,
				...preferences,
			}),
		})
	);
}

export async function updateInterestsDraft(params: {
	draftId: string;
	draftToken: string;
	interests: string[];
}) {
	const { draftId, draftToken, interests } = params;
	return unwrap<OnboardingDraftRecord>(
		apiFetch(`${API_PREFIX}/profiles/draft/interests`, {
			skipAuth: true,
			method: "POST",
			body: JSON.stringify({
				draftId,
				draftToken,
				interestSlugs: interests,
			}),
		})
	);
}

export async function updateDraftPhotos(params: {
	deviceId: string;
	draftToken: string;
	photos: string[];
}) {
	const { deviceId, draftToken, photos } = params;
	return unwrap<OnboardingDraftRecord>(
		apiFetch(`${API_PREFIX}/onboarding/drafts`, {
			skipAuth: true,
			method: "POST",
			body: JSON.stringify({
				deviceId,
				draftToken,
				payload: {
					photos,
				},
			}),
		})
	);
}

export async function requestPresignedUpload(params: {
	contentType: string;
	scope: string;
	draftId: string;
	draftToken: string;
}) {
	const { contentType, scope, draftId, draftToken } = params;
	return unwrap<PresignUploadResponse>(
		apiFetch(`${API_PREFIX}/media/presign`, {
			skipAuth: true,
			method: "POST",
			body: JSON.stringify({
				contentType,
				scope,
				draftId,
				draftToken,
			}),
		})
	);
}
