import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	Alert,
	ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useOnboardingStore } from "@/src/stores/onboarding-store";

export default function ProfileStep5Screen() {
	const router = useRouter();
	const { data, updateData } = useOnboardingStore();
	const [photoUri, setPhotoUri] = useState<string | null>(data.photoUrl || null);
	const [isGenerating, setIsGenerating] = useState(false);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setPhotoUri(result.assets[0].uri);
			updateData({ photoUrl: result.assets[0].uri });
		}
	};

	const generateAvatar = () => {
		setIsGenerating(true);
		// Générer un avatar abstrait basé sur les initiales
		const firstName = data.firstName || "U";
		const initial = firstName.charAt(0).toUpperCase();
		const colors = [
			"#6366f1",
			"#8b5cf6",
			"#ec4899",
			"#f43f5e",
			"#14b8a6",
			"#06b6d4",
		];
		const color = colors[initial.charCodeAt(0) % colors.length];

		// Pour une vraie implémentation, vous devriez créer une image SVG ou utiliser un service
		// Pour l'instant, on va juste stocker une URL placeholder
		setPhotoUri(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="${color}"/><text x="50%" y="50%" font-size="80" fill="white" text-anchor="middle" dominant-baseline="middle">${initial}</text></svg>`)}`);
		updateData({ photoUrl: `avatar-${initial}-${color}` });
		setIsGenerating(false);
	};

	const handleFinish = () => {
		if (photoUri) {
			updateData({ photoUrl: photoUri });
		}
		router.push("/(onboarding)/confirmation");
	};

	const handleSkip = () => {
		router.push("/(onboarding)/confirmation");
	};

	return (
		<View className="flex-1 bg-white dark:bg-black">
			<View className="flex-1 justify-center px-6 py-12">
				<Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
					<Trans id="onboarding.profile.step5.title">Ta photo</Trans>
				</Text>
				<Text className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
					<Trans id="onboarding.profile.step5.subtitle">
						Ajoute une photo ou génère un avatar abstrait
					</Trans>
				</Text>

				<View className="items-center mb-8">
					{photoUri ? (
						<Image
							source={{ uri: photoUri }}
							className="w-32 h-32 rounded-full"
						/>
					) : (
						<View className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-700 items-center justify-center">
							<Text className="text-4xl text-zinc-400 dark:text-zinc-500">
								{data.firstName?.charAt(0).toUpperCase() || "?"}
							</Text>
						</View>
					)}
				</View>

				<View className="space-y-4">
					<TouchableOpacity
						onPress={pickImage}
						className="rounded-xl border-2 border-zinc-200 dark:border-zinc-700 py-4"
					>
						<Text className="text-center text-base font-semibold text-zinc-900 dark:text-zinc-100">
							<Trans id="onboarding.profile.step5.importPhoto">
								Importer une photo
							</Trans>
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={generateAvatar}
						disabled={isGenerating}
						className="rounded-xl border-2 border-zinc-200 dark:border-zinc-700 py-4"
					>
						{isGenerating ? (
							<ActivityIndicator size="small" color="#6366f1" />
						) : (
							<Text className="text-center text-base font-semibold text-zinc-900 dark:text-zinc-100">
								<Trans id="onboarding.profile.step5.generateAvatar">
									Générer un avatar abstrait
								</Trans>
							</Text>
						)}
					</TouchableOpacity>
				</View>

				<View className="mt-8 space-y-4">
					<TouchableOpacity
						onPress={handleFinish}
						className="rounded-xl bg-blue-600 py-4"
					>
						<Text className="text-center text-base font-semibold text-white">
							<Trans id="onboarding.profile.step5.finish">Terminer</Trans>
						</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={handleSkip}>
						<Text className="text-center text-base text-zinc-600 dark:text-zinc-400">
							<Trans id="onboarding.profile.step5.skip">Passer cette étape</Trans>
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

