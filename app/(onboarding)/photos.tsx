import { t } from "@lingui/macro";
import { Trans } from "@lingui/react/macro";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	Text,
	View,
} from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { usePresignUpload } from "@/src/hooks/use-presign-upload";
import { extractErrorMessage } from "@/src/utils/error";

const MAX_PHOTOS = 3;

export default function PhotosScreen() {
	const router = useRouter();
	const photos = useOnboardingDraft((state) => state.photos);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("photos");
	const { uploadPhoto, retryPhotoUpload, removePhoto, uploadingPhotoIds } =
		usePresignUpload();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [previewPhotoUri, setPreviewPhotoUri] = useState<string | null>(null);

	const uploadedPhotos = useMemo(
		() =>
			photos.filter((photo) => photo.status === "uploaded" && photo.remoteUrl),
		[photos]
	);

	const hasUploading = useMemo(
		() => photos.some((photo) => photo.status === "uploading"),
		[photos]
	);

	const handlePickPhoto = useCallback(async () => {
		setError(null);
		const permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permissions.granted) {
			setError(
				t({
					id: "onboarding.photos.permissionDenied",
					message: "Autorise l'accès à ta galerie pour importer une photo",
				})
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsMultipleSelection: false,
			quality: 0.9,
		});

		if (result.canceled || !result.assets || result.assets.length === 0) {
			return;
		}

		const asset = result.assets[0];
		try {
			await uploadPhoto(asset.uri, {
				contentType: asset.mimeType ?? "image/jpeg",
			});
		} catch (err) {
			setError(extractErrorMessage(err));
		}
	}, [uploadPhoto]);

	const handleRemove = useCallback(
		(photoId: string) => {
			Alert.alert(
				t({
					id: "onboarding.photos.removeAlert.title",
					message: "Supprimer la photo",
				}),
				t({
					id: "onboarding.photos.removeAlert.message",
					message: "Veux-tu retirer cette photo de ton profil ?",
				}),
				[
					{
						text: t({
							id: "onboarding.photos.removeAlert.cancel",
							message: "Annuler",
						}),
						style: "cancel",
					},
					{
						text: t({
							id: "onboarding.photos.removeAlert.delete",
							message: "Supprimer",
						}),
						style: "destructive",
						onPress: () => removePhoto(photoId),
					},
				]
			);
		},
		[removePhoto]
	);

	const handleOpenPreview = useCallback((uri: string) => {
		setPreviewPhotoUri(uri);
	}, []);

	const handleClosePreview = useCallback(() => {
		setPreviewPhotoUri(null);
	}, []);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

		if (uploadedPhotos.length === 0) {
			setLoading(false);
			setError(
				t({
					id: "onboarding.photos.errors.minPhotos",
					message: "Ajoute au moins une photo pour poursuivre",
				})
			);
			return;
		}

		if (hasUploading) {
			setLoading(false);
			setError(
				t({
					id: "onboarding.photos.errors.waitUploads",
					message: "Patiente pendant l’import de tes photos",
				})
			);
			return;
		}

		try {
			await saveDraft();
			trackContinue({ photos: uploadedPhotos.length });
			router.push("/(onboarding)/bio");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={<Trans id="onboarding.photos.title">Ajoute quelques photos</Trans>}
			subtitle={
				<Trans id="onboarding.photos.subtitle">
					Un profil authentique avec 1 à 3 photos lumineuses. Tu pourras les changer
					plus tard.
				</Trans>
			}
			headerAccessory={<StepIndicator current={7} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={loading}
					loading={loading}
					accessibilityLabel={t({
						id: "onboarding.photos.accessibility.continue",
						message: "Continuer vers la bio",
					})}
				/>
			}
		>
			<View className="flex-row flex-wrap gap-3">
				{photos.map((photo) => {
					const isUploading = photo.status === "uploading";
					const hasError = photo.status === "error";
					const photoUri = photo.localUri ?? photo.remoteUrl;
					return (
						<Pressable
							key={photo.id}
							onPress={() => {
								if (photoUri) {
									handleOpenPreview(photoUri);
								}
							}}
							disabled={!photoUri}
							className="relative h-32 w-24 overflow-hidden rounded-3xl border border-outline-200 bg-secondary-0 dark:border-zinc-700 dark:bg-zinc-900"
						>
							{photoUri ? (
								<Image
									source={{ uri: photoUri }}
									style={{ width: "100%", height: "100%" }}
									contentFit="cover"
								/>
							) : null}

							{isUploading || hasError ? (
								<View className="absolute inset-0 items-center justify-center bg-black/40">
									{isUploading ? <ActivityIndicator color="#fff" /> : null}
									{hasError ? (
										<Pressable
											onPress={(event) => {
												event.stopPropagation();
												retryPhotoUpload(photo.id);
											}}
										>
											<Text className="text-center text-xs font-semibold text-white">
												<Trans id="onboarding.photos.retry">Réessayer</Trans>
											</Text>
										</Pressable>
									) : null}
								</View>
							) : null}

							{!isUploading ? (
								<Pressable
									onPress={(event) => {
										event.stopPropagation();
										handleRemove(photo.id);
									}}
									className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1"
								>
									<Text className="text-xs font-semibold text-white">
										<Trans id="onboarding.photos.remove">Retirer</Trans>
									</Text>
								</Pressable>
							) : null}
						</Pressable>
					);
				})}

				{photos.length < MAX_PHOTOS ? (
					<Pressable
						onPress={handlePickPhoto}
						className="h-32 w-24 items-center justify-center rounded-3xl border border-dashed border-outline-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
					>
						<Text className="text-center text-sm font-semibold text-typography-500 dark:text-zinc-400">
							<Trans id="onboarding.photos.add">Ajouter</Trans>
						</Text>
					</Pressable>
				) : null}
			</View>

			{uploadingPhotoIds.length > 0 ? (
				<Text className="text-xs font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.photos.uploading">
						Import en cours… restez sur cette page
					</Trans>
				</Text>
			) : null}

			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}

			{previewPhotoUri ? (
				<Modal
					visible
					transparent
					animationType="fade"
					onRequestClose={handleClosePreview}
				>
					<Pressable
						onPress={handleClosePreview}
						className="flex-1 items-center justify-center bg-black/90 px-6"
					>
						<Image
							source={{ uri: previewPhotoUri }}
							style={{ width: "100%", height: "80%" }}
							contentFit="contain"
						/>
						<Text className="mt-4 text-base font-semibold text-white">
							<Trans id="onboarding.photos.preview.close">
								Appuie n&apos;importe où pour fermer
							</Trans>
						</Text>
					</Pressable>
				</Modal>
			) : null}
		</OnboardingShell>
	);
}
