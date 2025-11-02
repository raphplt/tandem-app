import { useMemo, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { Text, TextInput, View } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { onboardingPreferencesSchema } from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";

export default function PrefsAgeDistanceScreen() {
	const router = useRouter();
	const preferences = useOnboardingDraft((state) => state.preferences);
	const updatePreferences = useOnboardingDraft((state) => state.updatePreferences);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("prefs-age-distance");

	const [ageMin, setAgeMin] = useState(
		preferences.ageMin ? String(preferences.ageMin) : "25"
	);
	const [ageMax, setAgeMax] = useState(
		preferences.ageMax ? String(preferences.ageMax) : "35"
	);
	const [distanceKm, setDistanceKm] = useState(
		preferences.distanceKm ? String(preferences.distanceKm) : "30"
	);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isContinueDisabled = useMemo(
		() =>
			loading ||
			ageMin.trim().length === 0 ||
			ageMax.trim().length === 0 ||
			distanceKm.trim().length === 0,
		[ageMax, ageMin, distanceKm, loading]
	);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

		const parsedAgeMin = Number(ageMin);
		const parsedAgeMax = Number(ageMax);
		const parsedDistance = Number(distanceKm);

		const validation = onboardingPreferencesSchema.safeParse({
			ageMin: parsedAgeMin,
			ageMax: parsedAgeMax,
			distanceKm: parsedDistance,
		});

		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}

		updatePreferences(validation.data);

		try {
			await saveDraft({
				preferences: validation.data,
			});
			trackContinue(validation.data);
			router.push("/(onboarding)/interests");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={
				<Trans id="onboarding.preferences.title">
					Tes préférences de rencontres
				</Trans>
			}
			subtitle={
				<Trans id="onboarding.preferences.subtitle">
					Définis un cadre qui te ressemble, tu pourras le modifier à tout moment.
				</Trans>
			}
			headerAccessory={<StepIndicator current={5} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={isContinueDisabled}
					loading={loading}
					accessibilityLabel="Continuer vers tes centres d&apos;intérêt"
				/>
			}
		>
			<View className="flex flex-col" style={{ gap: 8 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.preferences.ageRange">
						Tranche d&apos;âge recherchée
					</Trans>
				</Text>
				<View className="flex-row gap-3">
					<View className="flex-1">
						<TextInput
							value={ageMin}
							onChangeText={setAgeMin}
							keyboardType="number-pad"
							placeholder="25"
							className="rounded-2xl border border-outline-200 bg-white px-4 py-3 text-center font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						/>
					</View>
					<View className="flex-1">
						<TextInput
							value={ageMax}
							onChangeText={setAgeMax}
							keyboardType="number-pad"
							placeholder="35"
							className="rounded-2xl border border-outline-200 bg-white px-4 py-3 text-center font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						/>
					</View>
				</View>
			</View>

			<View className="flex flex-col" style={{ gap: 8 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.preferences.distance">
						Distance maximale (km)
					</Trans>
				</Text>
				<TextInput
					value={distanceKm}
					onChangeText={setDistanceKm}
					keyboardType="number-pad"
					placeholder="30"
					className="rounded-2xl border border-outline-200 bg-white px-4 py-3 text-center font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				/>
			</View>

			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
