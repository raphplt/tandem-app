import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { useOnboardingStore } from "@/src/stores/onboarding-store";
import { onboardingStep3Schema } from "@/src/lib/validations/onboarding";

const placeholders = [
	"onboarding.profile.step4.placeholder1",
	"onboarding.profile.step4.placeholder2",
	"onboarding.profile.step4.placeholder3",
];

export default function ProfileStep4Screen() {
	const router = useRouter();
	const { data, updateData } = useOnboardingStore();
	const [bio, setBio] = useState(data.bio || "");
	const [error, setError] = useState<string | null>(null);
	const [placeholderIndex] = useState(
		Math.floor(Math.random() * placeholders.length)
	);

	const handleNext = () => {
		setError(null);
		const result = onboardingStep3Schema.safeParse({ bio });

		if (!result.success) {
			setError(result.error.errors[0].message);
			return;
		}

		updateData({ bio });
		router.push("/(onboarding)/profile-step-5");
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-white dark:bg-black"
		>
			<ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
				<View className="flex-1 justify-center px-6 py-12">
					<Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
						<Trans id="onboarding.profile.step4.title">Ta mini-bio</Trans>
					</Text>
					<Text className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
						<Trans id="onboarding.profile.step4.subtitle">
							En quelques mots, dis-nous ce qui te rend unique
						</Trans>
					</Text>

					<View>
						<TextInput
							multiline
							numberOfLines={6}
							textAlignVertical="top"
							placeholder="Ce qui me rend curieux…"
							placeholderTextColor="#9ca3af"
							value={bio}
							onChangeText={setBio}
							maxLength={500}
							className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 min-h-[120px]"
						/>
						<Text className="mt-2 text-right text-sm text-zinc-500 dark:text-zinc-400">
							{bio.length}/500
						</Text>
					</View>

					{error && (
						<Text className="mt-4 text-sm text-red-600 dark:text-red-400">
							{error}
						</Text>
					)}

					<TouchableOpacity
						onPress={handleNext}
						disabled={bio.length < 10}
						className={`mt-8 rounded-xl py-4 ${
							bio.length < 10 ? "bg-zinc-300 dark:bg-zinc-700" : "bg-blue-600"
						}`}
					>
						<Text className="text-center text-base font-semibold text-white">
							<Trans id="onboarding.common.continue">Continuer</Trans>
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
