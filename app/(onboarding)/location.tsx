import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { onboardingLocationSchema } from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";

export default function LocationScreen() {
	const router = useRouter();
	const profile = useOnboardingDraft((state) => state.profile);
	const updateProfile = useOnboardingDraft((state) => state.updateProfile);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("location");

	const [city, setCity] = useState(profile.city ?? "");
	const [country, setCountry] = useState(profile.country ?? "");
	const [latitude, setLatitude] = useState(
		profile.coords?.latitude ? String(profile.coords.latitude) : ""
	);
	const [longitude, setLongitude] = useState(
		profile.coords?.longitude ? String(profile.coords.longitude) : ""
	);
	const [showAdvanced, setShowAdvanced] = useState(Boolean(profile.coords));
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const coordsProvided =
		latitude.trim().length > 0 || longitude.trim().length > 0;

	const isContinueDisabled = useMemo(() => {
		return city.trim().length < 2 || country.trim().length < 2 || loading;
	}, [city, country, loading]);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

		if (coordsProvided && (!latitude.trim() || !longitude.trim())) {
			setError(
				"Renseigne latitude et longitude pour partager ta position précise"
			);
			setLoading(false);
			return;
		}

		const coords = coordsProvided
			? {
					latitude: parseFloat(latitude.replace(",", ".")),
					longitude: parseFloat(longitude.replace(",", ".")),
			  }
			: undefined;

		if (
			coords &&
			(!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude))
		) {
			setError("Coordonnées invalides");
			setLoading(false);
			return;
		}

		const validation = onboardingLocationSchema.safeParse({
			city,
			country,
			coords,
		});

		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}

		updateProfile({
			city: validation.data.city.trim(),
			country: validation.data.country.trim(),
			coords: validation.data.coords,
		});

		try {
			await saveDraft({
				profile: {
					city: validation.data.city.trim(),
					country: validation.data.country.trim(),
					coords: validation.data.coords,
				},
			});
			trackContinue();
			router.push("/(onboarding)/prefs-age-distance");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<OnboardingShell
			title={<Trans id="onboarding.location.title">Où es-tu basé(e) ?</Trans>}
			subtitle={
				<Trans id="onboarding.location.subtitle">
					Flint vous propose des rencontres proches de chez vous, garde la main sur
					ce que tu partages.
				</Trans>
			}
			headerAccessory={<StepIndicator current={4} total={9} />}
			footer={
				<OnboardingGradientButton
					label={<Trans id="onboarding.common.continue">Continuer</Trans>}
					onPress={handleContinue}
					disabled={isContinueDisabled}
					loading={loading}
					accessibilityLabel="Continuer vers les préférences"
				/>
			}
		>
			<View className="flex flex-col" style={{ gap: 12 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.location.city">Ville</Trans>
				</Text>
				<TextInput
					value={city}
					onChangeText={setCity}
					placeholder="Paris"
					autoCapitalize="words"
					autoComplete="street-address"
					className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				/>
			</View>

			<View className="flex flex-col" style={{ gap: 12 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.location.country">Pays</Trans>
				</Text>
				<TextInput
					value={country}
					onChangeText={setCountry}
					placeholder="France"
					autoCapitalize="words"
					autoComplete="country"
					className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				/>
			</View>

			<Pressable
				onPress={() => setShowAdvanced((prev) => !prev)}
				className="flex-row items-center space-x-2"
			>
				<Text className="text-sm font-semibold text-typography-500 underline dark:text-zinc-300">
					{showAdvanced ? (
						<Trans id="onboarding.location.hideAdvanced">
							Masquer les coordonnées
						</Trans>
					) : (
						<Trans id="onboarding.location.showAdvanced">
							Ajouter la latitude / longitude (optionnel)
						</Trans>
					)}
				</Text>
			</Pressable>

			{showAdvanced ? (
				<View className="flex-row gap-4">
					<View className="flex-1 flex flex-col" style={{ gap: 8 }}>
						<Text className="text-xs font-body text-typography-500 dark:text-zinc-400">
							<Trans id="onboarding.location.latitude">Latitude</Trans>
						</Text>
						<TextInput
							value={latitude}
							onChangeText={setLatitude}
							placeholder="48.8566"
							keyboardType="decimal-pad"
							className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						/>
					</View>
					<View className="flex-1 flex flex-col" style={{ gap: 8 }}>
						<Text className="text-xs font-body text-typography-500 dark:text-zinc-400">
							<Trans id="onboarding.location.longitude">Longitude</Trans>
						</Text>
						<TextInput
							value={longitude}
							onChangeText={setLongitude}
							placeholder="2.3522"
							keyboardType="decimal-pad"
							className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						/>
					</View>
				</View>
			) : null}

			{error ? (
				<Text className="text-sm font-body text-error-500" role="alert">
					{error}
				</Text>
			) : null}
		</OnboardingShell>
	);
}
