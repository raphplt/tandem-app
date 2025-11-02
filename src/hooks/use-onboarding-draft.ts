import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
	fetchOnboardingDraft,
	saveOnboardingDraft,
	updateDraftPhotos,
} from "@/src/lib/onboarding/service";
import type {
	DraftPhoto,
	OnboardingDraftPayload,
	OnboardingDraftRecord,
	OnboardingPreferencesDraft,
	OnboardingProfileDraft,
	OnboardingProfilePayload,
	OnboardingStepKey,
} from "@/src/lib/onboarding/types";

const STORAGE_KEY = "onboarding-draft-v1";

const generateDeviceId = () => {
	const randomSegment = Math.random().toString(36).slice(2, 10);
	const timestamp = Date.now().toString(36);
	return `tdm-${timestamp}-${randomSegment}`;
};

const createInitialState = () => ({
	deviceId: undefined as string | undefined,
	draftId: undefined as string | undefined,
	draftToken: undefined as string | undefined,
	expiresAt: undefined as string | undefined,
	profile: {} as OnboardingProfileDraft,
	preferences: {} as OnboardingPreferencesDraft,
	interests: [] as string[],
	photos: [] as DraftPhoto[],
	step: "intro-values" as OnboardingStepKey,
	hydratedFromRemote: false,
});

type OnboardingDraftState = ReturnType<typeof createInitialState> & {
	setStep: (step: OnboardingStepKey) => void;
	updateProfile: (data: Partial<OnboardingProfileDraft>) => void;
	updatePreferences: (data: Partial<OnboardingPreferencesDraft>) => void;
	setInterests: (interests: string[]) => void;
	addPhoto: (photo: DraftPhoto) => void;
	updatePhoto: (id: string, data: Partial<DraftPhoto>) => void;
	removePhoto: (id: string) => void;
	replacePhotoList: (photos: DraftPhoto[]) => void;
	setDraftMeta: (meta: {
		draftId?: string;
		draftToken?: string;
		expiresAt?: string;
	}) => void;
	ensureDeviceId: () => string;
	reset: () => void;
	mergeRemoteDraft: (record: OnboardingDraftRecord) => void;
	loadRemoteDraft: (params: { deviceId: string; draftToken?: string }) => Promise<
		OnboardingDraftRecord | null
	>;
	saveDraft: (payload?: OnboardingDraftPayload) => Promise<OnboardingDraftRecord>;
	syncPhotosWithRemote: (remoteUrls: string[]) => Promise<OnboardingDraftRecord>;
};

const mapRemotePhotos = (remotePhotos?: string[]): DraftPhoto[] => {
	if (!remotePhotos || remotePhotos.length === 0) {
		return [];
	}
	return remotePhotos.map((url) => ({
		id: url,
		remoteUrl: url,
		status: "uploaded" as const,
		uploadedAt: new Date().toISOString(),
	}));
};

const toPayload = (state: OnboardingDraftState): OnboardingDraftPayload => {
	const { profile, preferences, interests, photos } = state;

	const payload: OnboardingDraftPayload = {};

	if (Object.keys(profile).length > 0) {
		const { coords, ...restProfile } = profile;
		const profilePayload: OnboardingProfilePayload = {
			...restProfile,
			...(coords
				? { lat: coords.latitude, lng: coords.longitude }
				: {}),
		};
		payload.profile = profilePayload;
	}

	if (Object.keys(preferences).length > 0) {
		payload.preferences = { ...preferences };
	}

	if (interests.length > 0) {
		payload.interests = interests;
	}

	const uploaded = photos
		.filter((photo) => photo.status === "uploaded" && photo.remoteUrl)
		.map((photo) => photo.remoteUrl!) as string[];

	if (uploaded.length > 0) {
		payload.photos = uploaded;
	}

	return payload;
};

const mapRemoteProfile = (
	payloadProfile: OnboardingDraftPayload["profile"]
): OnboardingProfileDraft => {
	if (!payloadProfile) return {};
	const { lat, lng, ...rest } = payloadProfile as OnboardingProfileDraft & {
		lat?: number;
		lng?: number;
	};
	return {
		...rest,
		...(typeof lat === "number" && typeof lng === "number"
			? { coords: { latitude: lat, longitude: lng } }
			: {}),
	};
};

export const useOnboardingDraft = create<OnboardingDraftState>()(
	persist(
		(set, get) => ({
			...createInitialState(),
			setStep: (step) => set({ step }),
			updateProfile: (data) =>
				set((state) => ({
					profile: { ...state.profile, ...data },
				})),
			updatePreferences: (data) =>
				set((state) => ({
					preferences: { ...state.preferences, ...data },
				})),
			setInterests: (interests) => set({ interests }),
			addPhoto: (photo) =>
				set((state) => ({
					photos: [...state.photos, photo],
				})),
			updatePhoto: (id, data) =>
				set((state) => ({
					photos: state.photos.map((photo) =>
						photo.id === id ? { ...photo, ...data } : photo
					),
				})),
			removePhoto: (id) =>
				set((state) => ({
					photos: state.photos.filter((photo) => photo.id !== id),
				})),
			replacePhotoList: (photos) => set({ photos }),
			setDraftMeta: (meta) =>
				set((state) => ({
					draftId: meta.draftId ?? state.draftId,
					draftToken: meta.draftToken ?? state.draftToken,
					expiresAt: meta.expiresAt ?? state.expiresAt,
				})),
			ensureDeviceId: () => {
				const current = get().deviceId;
				if (current) return current;
				const next = generateDeviceId();
				set({ deviceId: next });
				return next;
			},
			reset: () =>
				set((state) => ({
					...createInitialState(),
					deviceId: state.deviceId,
				})),
			mergeRemoteDraft: (record) =>
				set({
					deviceId: record.deviceId ?? get().deviceId ?? generateDeviceId(),
					draftId: record.draftId,
					draftToken: record.draftToken,
					expiresAt: record.expiresAt,
					profile: {
						...get().profile,
						...mapRemoteProfile(record.payload.profile),
					},
					preferences: {
						...get().preferences,
						...(record.payload.preferences ?? {}),
					},
					interests: record.payload.interests ?? get().interests,
					photos: mapRemotePhotos(record.payload.photos),
					hydratedFromRemote: true,
				}),
			loadRemoteDraft: async ({ deviceId, draftToken }) => {
				try {
					const record = await fetchOnboardingDraft({ deviceId, draftToken });
					get().mergeRemoteDraft(record);
					return record;
				} catch (error) {
					console.warn("[Onboarding] loadRemoteDraft failed", error);
					return null;
				}
			},
			saveDraft: async (payloadOverride) => {
				const state = get();
				const deviceId = state.ensureDeviceId();
				const draftToken = state.draftToken;
				const payload =
					payloadOverride ??
					toPayload({
						...state,
						photos: state.photos,
					});
				const record = await saveOnboardingDraft({
					deviceId,
					draftToken,
					payload,
				});
				get().mergeRemoteDraft(record);
				return record;
			},
			syncPhotosWithRemote: async (remoteUrls) => {
				const state = get();
				const deviceId = state.ensureDeviceId();
				const draftToken = state.draftToken;
				if (!draftToken) {
					throw new Error("Draft token missing while syncing photos");
				}
				const record = await updateDraftPhotos({
					deviceId,
					draftToken,
					photos: remoteUrls,
				});
				get().mergeRemoteDraft(record);
				return record;
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				deviceId: state.deviceId,
				draftId: state.draftId,
				draftToken: state.draftToken,
				expiresAt: state.expiresAt,
				profile: state.profile,
				preferences: state.preferences,
				interests: state.interests,
				photos: state.photos,
				step: state.step,
				hydratedFromRemote: state.hydratedFromRemote,
			}),
		}
	)
);

export const onboardingDraftSelectors = {
	meta: (state: OnboardingDraftState) => ({
		deviceId: state.deviceId,
		draftId: state.draftId,
		draftToken: state.draftToken,
		expiresAt: state.expiresAt,
	}),
	profile: (state: OnboardingDraftState) => state.profile,
	preferences: (state: OnboardingDraftState) => state.preferences,
	interests: (state: OnboardingDraftState) => state.interests,
	photos: (state: OnboardingDraftState) => state.photos,
	step: (state: OnboardingDraftState) => state.step,
	hydratedFromRemote: (state: OnboardingDraftState) => state.hydratedFromRemote,
};
