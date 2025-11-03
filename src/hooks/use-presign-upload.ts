import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useMemo } from "react";

import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { requestPresignedUpload } from "@/src/lib/onboarding/service";
import type { PresignUploadResponse } from "@/src/lib/onboarding/types";
import { extractErrorMessage } from "@/src/utils/error";

const DEFAULT_CONTENT_TYPE = "image/jpeg";
const DEFAULT_SCOPE = "photos/profile";

const createPhotoId = () => {
	const randomSegment = Math.random().toString(36).slice(2, 10);
	const timestamp = Date.now().toString(36);
	return `photo-${timestamp}-${randomSegment}`;
};

type UploadOptions = {
	contentType?: string;
	scope?: string;
};

type UploadResult = {
	remoteUrl: string;
	presign: PresignUploadResponse;
};

async function uploadToPresignedUrl(params: {
	url: string;
	localUri: string;
	contentType: string;
}) {
	const { url, localUri, contentType } = params;
	const uploadResult = await FileSystem.uploadAsync(url, localUri, {
		httpMethod: "PUT",
		headers: {
			"Content-Type": contentType,
		},
		uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
	});

	if (uploadResult.status >= 400) {
		throw new Error(
			`Upload failed with status ${uploadResult.status}: ${
				uploadResult.body ?? "Unknown"
			}`
		);
	}

	return uploadResult;
}

export function usePresignUpload() {
	const ensureDeviceId = useOnboardingDraft((state) => state.ensureDeviceId);
	const addPhoto = useOnboardingDraft((state) => state.addPhoto);
	const updatePhoto = useOnboardingDraft((state) => state.updatePhoto);
	const removePhoto = useOnboardingDraft((state) => state.removePhoto);
	const syncPhotosWithRemote = useOnboardingDraft(
		(state) => state.syncPhotosWithRemote
	);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const photos = useOnboardingDraft((state) => state.photos);

	const performUpload = useCallback(
		async ({
			photoId,
			localUri,
			contentType,
			scope,
		}: {
			photoId: string;
			localUri: string;
			contentType: string;
			scope: string;
		}): Promise<UploadResult> => {
			ensureDeviceId();

			let { draftId, draftToken } = useOnboardingDraft.getState();
			if (!draftId || !draftToken) {
				const record = await saveDraft({});
				draftId = record.draftId;
				draftToken = record.draftToken;
			}

			if (!draftId || !draftToken) {
				throw new Error("Le draft est introuvable, impossible d'envoyer la photo.");
			}

			const presign = await requestPresignedUpload({
				contentType,
				scope,
				draftId,
				draftToken,
			});

			await uploadToPresignedUrl({
				url: presign.url,
				localUri,
				contentType,
			});

			const remoteUrl = presign.publicUrl ?? presign.key;
			if (!remoteUrl) {
				throw new Error("L'URL distante de la photo est manquante.");
			}

			updatePhoto(photoId, {
				remoteUrl,
				status: "uploaded",
				errorMessage: undefined,
				uploadedAt: new Date().toISOString(),
			});

			const uploadedRemoteUrls = useOnboardingDraft
				.getState()
				.photos.filter((photo) => photo.status === "uploaded" && photo.remoteUrl)
				.map((photo) => photo.remoteUrl!) as string[];

			await syncPhotosWithRemote(uploadedRemoteUrls);

			return { remoteUrl, presign };
		},
		[ensureDeviceId, saveDraft, syncPhotosWithRemote, updatePhoto]
	);

	const uploadPhoto = useCallback(
		async (localUri: string, options?: UploadOptions) => {
			const contentType = options?.contentType ?? DEFAULT_CONTENT_TYPE;
			const scope = options?.scope ?? DEFAULT_SCOPE;
			const photoId = createPhotoId();

			addPhoto({
				id: photoId,
				localUri,
				contentType,
				status: "uploading",
			});

			try {
				const result = await performUpload({
					photoId,
					localUri,
					contentType,
					scope,
				});
				return result;
			} catch (error) {
				const message = extractErrorMessage(error);
				updatePhoto(photoId, {
					status: "error",
					errorMessage: message,
				});
				throw new Error(message);
			}
		},
		[addPhoto, performUpload, updatePhoto]
	);

	const retryPhotoUpload = useCallback(
		async (photoId: string) => {
			const photo = useOnboardingDraft
				.getState()
				.photos.find((item) => item.id === photoId);
			if (!photo || !photo.localUri) {
				throw new Error("Impossible de retrouver la photo à renvoyer.");
			}

			const contentType = photo.contentType ?? DEFAULT_CONTENT_TYPE;
			const scope = DEFAULT_SCOPE;

			updatePhoto(photoId, {
				status: "uploading",
				errorMessage: undefined,
			});

			try {
				return await performUpload({
					photoId,
					localUri: photo.localUri,
					contentType,
					scope,
				});
			} catch (error) {
				const message = extractErrorMessage(error);
				updatePhoto(photoId, {
					status: "error",
					errorMessage: message,
				});
				throw new Error(message);
			}
		},
		[performUpload, updatePhoto]
	);

	const removePhotoById = useCallback(
		(photoId: string) => {
			removePhoto(photoId);
			const uploadedRemoteUrls = useOnboardingDraft
				.getState()
				.photos.filter((photo) => photo.status === "uploaded" && photo.remoteUrl)
				.map((photo) => photo.remoteUrl!) as string[];

			if (useOnboardingDraft.getState().draftToken) {
				syncPhotosWithRemote(uploadedRemoteUrls).catch((error) => {
					console.warn("[Onboarding] Failed to sync photos after removal", error);
				});
			}
		},
		[removePhoto, syncPhotosWithRemote]
	);

	const uploadingPhotoIds = useMemo(
		() =>
			photos
				.filter((photo) => photo.status === "uploading")
				.map((photo) => photo.id),
		[photos]
	);

	const hasUploadError = useMemo(
		() => photos.some((photo) => photo.status === "error"),
		[photos]
	);

	return {
		uploadPhoto,
		retryPhotoUpload,
		removePhoto: removePhotoById,
		uploadingPhotoIds,
		hasUploadError,
	};
}
