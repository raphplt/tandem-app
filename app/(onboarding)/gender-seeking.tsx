import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { onboardingGenderSeekingSchema } from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";
import { Gender } from "@/types/user";

const genderChoices: { value: Gender; label: string; description: string }[] = [
	{
		value: Gender.FEMALE,
		label: "Femme",
		description: "Je m’identifie comme femme",
	},
	{
		value: Gender.MALE,
		label: "Homme",
		description: "Je m’identifie comme homme",
	},
	{
		value: Gender.NON_BINARY,
		label: "Non binaire",
		description: "Je m’identifie hors du binaire",
	},
	{
		value: Gender.OTHER,
		label: "Autre",
		description: "Je décris mon genre autrement",
	},
	{
		value: Gender.PREFER_NOT_TO_SAY,
		label: "Préférez ne pas dire",
		description: "Je préfère garder cela pour moi",
	},
];

const seekingChoices: { value: Gender; label: string }[] = [
	{ value: Gender.MALE, label: "Hommes" },
	{ value: Gender.FEMALE, label: "Femmes" },
	{ value: Gender.NON_BINARY, label: "Personnes non binaires" },
	{ value: Gender.OTHER, label: "Autres" },
];

export default function GenderSeekingScreen() {
	const router = useRouter();
	const profile = useOnboardingDraft((state) => state.profile);
	const updateProfile = useOnboardingDraft((state) => state.updateProfile);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("gender-seeking");

	const [gender, setGender] = useState<Gender | null>(profile.gender ?? null);
	const [seeking, setSeeking] = useState<Gender[]>(profile.seeking ?? []);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isContinueDisabled = useMemo(
		() => !gender || seeking.length === 0 || loading,
		[gender, loading, seeking.length]
	);

	const toggleSeeking = (value: Gender) => {
		setError(null);
		setSeeking((prev) => {
			if (prev.includes(value)) {
				return prev.filter((item) => item !== value);
			}
			if (prev.length >= 3) {
				return prev;
			}
			return [...prev, value];
		});
	};

	const handleContinue = async () => {
		setLoading(true);
		setError(null);

		const validation = onboardingGenderSeekingSchema.safeParse({
			gender,
			seeking,
		});

		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}

		updateProfile({
			gender: validation.data.gender,
			seeking: validation.data.seeking,
		});

		try {
			await saveDraft({
				profile: {
					gender: validation.data.gender,
					seeking: validation.data.seeking,
				},
			});
			trackContinue({ seeking: validation.data.seeking.length });
			router.push("/(onboarding)/birthdate");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={
				<Trans id="onboarding.genderSeeking.title">
					Parle-nous de toi et de qui tu souhaites rencontrer
				</Trans>
			}
			subtitle={
				<Trans id="onboarding.genderSeeking.subtitle">
					Sélectionne ton genre et les personnes avec lesquelles tu souhaites
					partager un match.
				</Trans>
			}
			headerAccessory={<StepIndicator current={2} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={isContinueDisabled}
					loading={loading}
					accessibilityLabel="Continuer vers la date de naissance"
				/>
			}
		>
			<View className="flex flex-col" style={{ gap: 16 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.genderSeeking.genderLabel">Ton genre</Trans>
				</Text>
				<View className="flex flex-col" style={{ gap: 12 }}>
					{genderChoices.map((choice) => {
						const selected = gender === choice.value;
						return (
							<Pressable
								key={choice.value}
								onPress={() => setGender(choice.value)}
								className={`rounded-2xl border px-4 py-3 ${
									selected
										? "border-accentGold-500 bg-accentGold-50"
										: "border-outline-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
								}`}
							>
								<Text
									className={`text-base font-semibold ${
										selected
											? "dark:text-typography-600 text-typography-500"
											: "text-typography-900 dark:text-zinc-100"
									}`}
								>
									{choice.label}
								</Text>
								<Text className="mt-1 text-sm font-body text-typography-500 dark:text-zinc-400">
									{choice.description}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>

			<View className="flex flex-col" style={{ gap: 16 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.genderSeeking.seekingLabel">
						Tu souhaites rencontrer
					</Trans>
				</Text>
				<View className="flex-row flex-wrap gap-2">
					{seekingChoices.map((choice) => {
						const selected = seeking.includes(choice.value);
						return (
							<Pressable
								key={choice.value}
								onPress={() => toggleSeeking(choice.value)}
								className={`rounded-full border px-4 py-2 ${
									selected
										? "border-accentRose-500 bg-accentRose-100"
										: "border-outline-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
								}`}
							>
								<Text
									className={`text-sm font-semibold ${
										selected
											? "text-accentRose-700"
											: "text-typography-600 dark:text-zinc-300"
									}`}
								>
									{choice.label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>

			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
