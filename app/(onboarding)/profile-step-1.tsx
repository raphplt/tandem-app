import { onboardingStep1Schema } from "@/src/lib/validations/onboarding";
import { useOnboardingStore } from "@/src/stores/onboarding-store";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function ProfileStep1Screen() {
	const router = useRouter();
	const { data, updateData } = useOnboardingStore();
	const [firstName, setFirstName] = useState(data.firstName || "");
	const [age, setAge] = useState(data.age?.toString() || "");
	const [error, setError] = useState<string | null>(null);

	const handleNext = () => {
		setError(null);
		const ageNum = parseInt(age, 10);

		const result = onboardingStep1Schema.safeParse({
			firstName,
			age: ageNum,
		});

		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}

		updateData({ firstName, age: ageNum });
		router.push("/(onboarding)/profile-step-2");
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-white dark:bg-black"
		>
			<ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
				<View className="flex-1 justify-center px-6 py-12">
					<Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
						<Trans id="onboarding.profile.step1.title">Qui es-tu ?</Trans>
					</Text>
					<Text className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
						<Trans id="onboarding.profile.step1.subtitle">
							Commence par te présenter simplement
						</Trans>
					</Text>

					<View className="space-y-6">
						<View>
							<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
								<Trans id="onboarding.profile.step1.firstName">Prénom</Trans>
							</Text>
							<TextInput
								autoCapitalize="words"
								autoComplete="name"
								placeholder="Jean"
								placeholderTextColor="#9ca3af"
								value={firstName}
								onChangeText={setFirstName}
								className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							/>
						</View>

						<View>
							<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
								<Trans id="onboarding.profile.step1.age">Âge</Trans>
							</Text>
							<TextInput
								keyboardType="number-pad"
								placeholder="28"
								placeholderTextColor="#9ca3af"
								value={age}
								onChangeText={setAge}
								className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							/>
						</View>
					</View>

					{error && (
						<Text className="mt-4 text-sm text-red-600 dark:text-red-400">
							{error}
						</Text>
					)}

					<TouchableOpacity
						onPress={handleNext}
						disabled={!firstName || !age}
						className={`mt-8 rounded-xl py-4 ${
							!firstName || !age ? "bg-zinc-300 dark:bg-zinc-700" : "bg-blue-600"
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
