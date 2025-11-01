import { useAuthSession } from "@/hooks/use-auth-session";
import { useCreateProfile } from "@/src/hooks/use-profiles";
import { useOnboardingStore } from "@/src/stores/onboarding-store";
import { Trans } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ConfirmationScreen() {
	const router = useRouter();
	const { data: onboardingData, reset } = useOnboardingStore();
	const { data: session } = useAuthSession();
	const createProfile = useCreateProfile();
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		handleCreateProfile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCreateProfile = async () => {
		if (!session?.user?.id) {
			Alert.alert("Erreur", "Session utilisateur non trouvée");
			console.error("Session utilisateur non trouvée");
			return;
		}

		// Validation des données requises
		if (
			!onboardingData.bio ||
			!onboardingData.age ||
			!onboardingData.city ||
			!onboardingData.gender ||
			!onboardingData.interestedIn
		) {
			Alert.alert("Erreur", "Certaines données requises sont manquantes");
			console.error("Certaines données requises sont manquantes");
			return;
		}

		setIsCreating(true);

		try {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			// Ne pas envoyer photoUrl si c'est une URI locale (file:// ou data:)
			// Le backend attend une URL HTTP valide
			const isLocalUri =
				onboardingData.photoUrl?.startsWith("file://") ||
				onboardingData.photoUrl?.startsWith("data:") ||
				onboardingData.photoUrl?.startsWith("avatar-");

			// Préparer les données du profil en nettoyant les valeurs undefined/vides
			const profileData: any = {
				bio: onboardingData.bio.trim(),
				city: onboardingData.city.trim(),
				age: onboardingData.age,
				gender: onboardingData.gender,
				interestedIn: onboardingData.interestedIn,
			};

			// Ajouter country seulement si fourni et non vide
			if (onboardingData.country && onboardingData.country.trim().length > 0) {
				profileData.country = onboardingData.country.trim();
			}

			// Ajouter photoUrl seulement si c'est une URL HTTP valide
			if (onboardingData.photoUrl && !isLocalUri) {
				// Vérifier que c'est bien une URL valide
				try {
					new URL(onboardingData.photoUrl);
					profileData.photoUrl = onboardingData.photoUrl;
				} catch {
					// Ce n'est pas une URL valide, on ne l'envoie pas
					console.warn(
						"[Onboarding] photoUrl n'est pas une URL valide:",
						onboardingData.photoUrl
					);
				}
			}

			// Ajouter preferences seulement s'il y a des intérêts
			if (onboardingData.interests && onboardingData.interests.length > 0) {
				profileData.preferences = {
					interests: onboardingData.interests,
				};
			}

			if (__DEV__) {
				console.log(
					"[Onboarding] Sending profile data:",
					JSON.stringify(profileData, null, 2)
				);
			}

			await createProfile.mutateAsync(profileData);

			reset();
			router.replace("/(tabs)");
		} catch (error: any) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

			let errorMessage = "Une erreur est survenue lors de la création du profil";

			if (error.message) {
				errorMessage = error.message;
			} else if (typeof error === "string") {
				errorMessage = error;
			}

			console.error(
				"Une erreur est survenue lors de la création du profil",
				error
			);
			Alert.alert("Erreur", errorMessage);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<View className="flex-1 bg-white dark:bg-black">
			<View className="flex-1 justify-center items-center px-6 py-12">
				{isCreating ? (
					<>
						<ActivityIndicator size="large" className="mb-4" />
						<Text className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
							<Trans id="onboarding.confirmation.creating">Crée ton profil...</Trans>
						</Text>
					</>
				) : (
					<>
						<Text className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 text-center">
							<Trans id="onboarding.confirmation.title">Bienvenue sur Tandem 🌿</Trans>
						</Text>
						<Text className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 text-center">
							<Trans id="onboarding.confirmation.subtitle">
								Ton premier match est disponible maintenant.
							</Trans>
						</Text>

						<TouchableOpacity
							onPress={() => router.replace("/(tabs)")}
							className="rounded-xl bg-blue-600 py-4 px-8"
						>
							<Text className="text-center text-base font-semibold text-white">
								<Trans id="onboarding.confirmation.cta">Découvrir ma rencontre</Trans>
							</Text>
						</TouchableOpacity>
					</>
				)}
			</View>
		</View>
	);
}
