import { useOnboardingStore } from "@/src/stores/onboarding-store";
import { Gender } from "@/types/user";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { z } from "zod";

const citySchema = z.object({
	city: z
		.string()
		.min(2, "La ville doit contenir au moins 2 caractères")
		.max(100, "La ville ne peut pas dépasser 100 caractères"),
	country: z.string().min(2).max(100).optional(),
	gender: z.nativeEnum(Gender),
	interestedIn: z
		.array(z.nativeEnum(Gender))
		.min(1, "Sélectionnez au moins un genre"),
});

export default function ProfileStep2Screen() {
	const router = useRouter();
	const { t } = useLingui();
	const { data, updateData } = useOnboardingStore();
	const [city, setCity] = useState(data.city || "");
	const [country, setCountry] = useState(data.country || "");
	const [gender, setGender] = useState<Gender | undefined>(data.gender);
	const [interestedIn, setInterestedIn] = useState<Gender[]>(
		data.interestedIn || []
	);
	const [error, setError] = useState<string | null>(null);

	const genders = [
		{ value: Gender.MALE, label: "onboarding.profile.step2.gender.male" },
		{ value: Gender.FEMALE, label: "onboarding.profile.step2.gender.female" },
		{
			value: Gender.NON_BINARY,
			label: "onboarding.profile.step2.gender.nonBinary",
		},
		{ value: Gender.OTHER, label: "onboarding.profile.step2.gender.other" },
		{
			value: Gender.PREFER_NOT_TO_SAY,
			label: "onboarding.profile.step2.gender.preferNotToSay",
		},
	];

	const toggleInterestedIn = (g: Gender) => {
		if (interestedIn.includes(g)) {
			setInterestedIn(interestedIn.filter((gen) => gen !== g));
		} else {
			setInterestedIn([...interestedIn, g]);
		}
		setError(null);
	};

	const handleNext = () => {
		setError(null);
		const result = citySchema.safeParse({
			city,
			country: country || undefined,
			gender,
			interestedIn,
		});

		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}

		updateData({ city, country: country || undefined, gender, interestedIn });
		router.push("/(onboarding)/profile-step-3");
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-white dark:bg-black"
		>
			<ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
				<View className="flex-1 justify-center px-6 py-12">
					<Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
						<Trans id="onboarding.profile.step2.title">Ta localisation</Trans>
					</Text>
					<Text className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
						<Trans id="onboarding.profile.step2.subtitle">
							Où te trouves-tu et qui cherches-tu ?
						</Trans>
					</Text>

					<View className="space-y-6">
						<View>
							<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
								<Trans id="onboarding.profile.step2.city">Ville</Trans>
							</Text>
							<TextInput
								autoCapitalize="words"
								placeholder="Paris"
								placeholderTextColor="#9ca3af"
								value={city}
								onChangeText={setCity}
								className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							/>
						</View>

						<View>
							<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
								<Trans id="onboarding.profile.step2.country">Pays (optionnel)</Trans>
							</Text>
							<TextInput
								autoCapitalize="words"
								placeholder="France"
								placeholderTextColor="#9ca3af"
								value={country}
								onChangeText={setCountry}
								className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							/>
						</View>

						<View>
							<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
								<Trans id="onboarding.profile.step2.gender">Genre</Trans>
							</Text>
							<View className="flex-row flex-wrap gap-3">
								{genders.map((g) => (
									<TouchableOpacity
										key={g.value}
										onPress={() => {
											setGender(g.value);
											setError(null);
										}}
										className={`rounded-full px-4 py-2 border-2 ${
											gender === g.value
												? "bg-blue-600 border-blue-600"
												: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
										}`}
									>
										<Text
											className={`text-sm font-medium ${
												gender === g.value
													? "text-white"
													: "text-zinc-900 dark:text-zinc-100"
											}`}
										>
											<Trans id={g.label}>{g.value}</Trans>
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						<View>
							<Text className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
								<Trans id="onboarding.profile.step2.interestedIn">
									Intéressé(e) par
								</Trans>
							</Text>
							<View className="flex-row flex-wrap gap-3">
								{genders.map((g) => (
									<TouchableOpacity
										key={g.value}
										onPress={() => toggleInterestedIn(g.value)}
										className={`rounded-full px-4 py-2 border-2 ${
											interestedIn.includes(g.value)
												? "bg-blue-600 border-blue-600"
												: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
										}`}
									>
										<Text
											className={`text-sm font-medium ${
												interestedIn.includes(g.value)
													? "text-white"
													: "text-zinc-900 dark:text-zinc-100"
											}`}
										>
											<Trans id={g.label}>{g.value}</Trans>
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</View>

					{error && (
						<Text className="mt-4 text-sm text-red-600 dark:text-red-400">
							{error}
						</Text>
					)}

					<TouchableOpacity
						onPress={handleNext}
						disabled={!city || !gender || interestedIn.length === 0}
						className={`mt-8 rounded-xl py-4 ${
							!city || !gender || interestedIn.length === 0
								? "bg-zinc-300 dark:bg-zinc-700"
								: "bg-blue-600"
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
