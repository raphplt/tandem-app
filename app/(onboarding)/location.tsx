import { Trans } from "@lingui/react/macro";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import { onboardingLocationSchema } from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";

type CitySuggestion = {
	id: string;
	name: string;
	admin?: string | null;
	country: string;
	latitude: number;
	longitude: number;
};

type OpenMeteoSearchResponse = {
	results?: Array<{
		id?: number;
		name: string;
		country: string;
		admin1?: string;
		latitude: number;
		longitude: number;
	}>;
};

export default function LocationScreen() {
	const router = useRouter();
	const profile = useOnboardingDraft((state) => state.profile);
	const updateProfile = useOnboardingDraft((state) => state.updateProfile);
	const saveDraft = useOnboardingDraft((state) => state.saveDraft);
	const { trackContinue } = useOnboardingStep("location");

	const [city, setCity] = useState(profile.city ?? "");
	const [country, setCountry] = useState(profile.country ?? "");
	const [coords, setCoords] = useState(profile.coords);
	const [locationStatus, setLocationStatus] =
		useState<Location.PermissionStatus | null>(null);
	const [requestingLocation, setRequestingLocation] = useState(false);
	const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
	const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
	const [suggestionError, setSuggestionError] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isContinueDisabled = useMemo(() => {
		return city.trim().length < 2 || country.trim().length < 2 || loading;
	}, [city, country, loading]);

	useEffect(() => {
		Location.getForegroundPermissionsAsync()
			.then((permission) => {
				setLocationStatus(permission.status);
			})
			.catch(() => {
				// ignore permission errors on init
			});
	}, []);

	useEffect(() => {
		if (city.trim().length < 2) {
			setCitySuggestions([]);
			setSuggestionError(false);
			return;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(async () => {
			setFetchingSuggestions(true);
			setSuggestionError(false);

			try {
				const response = await fetch(
					`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
						city.trim()
					)}&count=6&language=fr&format=json`,
					{ signal: controller.signal }
				);

				if (!response.ok) {
					throw new Error("Impossible de récupérer les suggestions");
				}

				const data = (await response.json()) as OpenMeteoSearchResponse;
				const results = data.results?.map((result) => ({
					id: String(result.id ?? `${result.name}-${result.latitude}`),
					name: result.name,
					admin: result.admin1,
					country: result.country,
					latitude: result.latitude,
					longitude: result.longitude,
				}));

				setCitySuggestions(results ?? []);
			} catch (err) {
				if ((err as Error).name === "AbortError") {
					return;
				}
				setSuggestionError(true);
				setCitySuggestions([]);
			} finally {
				setFetchingSuggestions(false);
			}
		}, 350);

		return () => {
			controller.abort();
			clearTimeout(timeoutId);
		};
	}, [city]);

	const handleRequestLocation = useCallback(async () => {
		setRequestingLocation(true);
		setError(null);

		try {
			const permission = await Location.requestForegroundPermissionsAsync();
			setLocationStatus(permission.status);

			if (permission.status !== Location.PermissionStatus.GRANTED) {
				return;
			}

			const position = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Lowest,
			});

			const [reverseGeocode] = await Location.reverseGeocodeAsync(position.coords);

			if (reverseGeocode?.city) {
				setCity(reverseGeocode.city);
			}

			if (reverseGeocode?.country) {
				setCountry(reverseGeocode.country);
			}

			setCoords({
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			});
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setRequestingLocation(false);
		}
	}, []);

	const handleCityChange = useCallback((value: string) => {
		setCity(value);
		setCoords(undefined);
	}, []);

	const handleCountryChange = useCallback((value: string) => {
		setCountry(value);
		setCoords(undefined);
	}, []);

	const handleSelectSuggestion = useCallback((suggestion: CitySuggestion) => {
		setCity(suggestion.name);
		setCountry(suggestion.country);
		setCoords({
			latitude: suggestion.latitude,
			longitude: suggestion.longitude,
		});
		setCitySuggestions([]);
		setSuggestionError(false);
	}, []);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);

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
					WeTwo vous propose des rencontres proches de chez vous, garde la main sur
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
			<View
				className="rounded-3xl border border-outline-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
				style={{ gap: 12 }}
			>
				<View style={{ gap: 4 }}>
					<Text className="text-base font-semibold text-typography-900 dark:text-zinc-100">
						<Trans id="onboarding.location.permissionPrompt">
							Autorise WeTwo à détecter ta ville pour t’aider à rencontrer des
							personnes proches.
						</Trans>
					</Text>
					<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
						<Trans id="onboarding.location.permissionOptional">
							Tu peux refuser et sélectionner ta ville ci-dessous.
						</Trans>
					</Text>
				</View>
				<Pressable
					onPress={handleRequestLocation}
					disabled={requestingLocation}
					className="self-start rounded-full border border-outline-200 px-4 py-2 dark:border-zinc-700"
				>
					{requestingLocation ? (
						<ActivityIndicator size="small" />
					) : (
						<Text className="text-sm font-semibold text-typography-900 dark:text-zinc-100">
							<Trans id="onboarding.location.permissionButton">Autoriser</Trans>
						</Text>
					)}
				</Pressable>
				{locationStatus === Location.PermissionStatus.GRANTED ? (
					<Text className="text-xs font-body text-typography-500 dark:text-zinc-300">
						<Trans id="onboarding.location.permissionGranted">
							Localisation activée, modifie ta ville si besoin.
						</Trans>
					</Text>
				) : null}
				{locationStatus === Location.PermissionStatus.DENIED ? (
					<Text className="text-xs font-body text-typography-500 dark:text-zinc-400">
						<Trans id="onboarding.location.permissionDenied">
							Tu pourras toujours choisir ta ville manuellement.
						</Trans>
					</Text>
				) : null}
			</View>

			<View className="flex flex-col" style={{ gap: 12 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.location.city">Ville</Trans>
				</Text>
				<TextInput
					value={city}
					onChangeText={handleCityChange}
					placeholder="Paris"
					autoCapitalize="words"
					autoComplete="street-address"
					className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				/>
			</View>

			{(fetchingSuggestions || citySuggestions.length > 0 || suggestionError) &&
			city.trim().length >= 2 ? (
				<View className="rounded-2xl border border-outline-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
					{fetchingSuggestions ? (
						<View className="flex-row items-center justify-center px-4 py-3">
							<ActivityIndicator size="small" />
						</View>
					) : null}
					{citySuggestions.map((suggestion) => (
						<Pressable
							key={suggestion.id}
							onPress={() => handleSelectSuggestion(suggestion)}
							className="px-4 py-3 last:border-b-0 border-b border-outline-200 dark:border-zinc-800"
						>
							<Text className="text-base font-semibold text-typography-900 dark:text-zinc-100">
								{suggestion.admin
									? `${suggestion.name}, ${suggestion.admin}`
									: suggestion.name}
							</Text>
							<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
								{suggestion.country}
							</Text>
						</Pressable>
					))}
					{suggestionError &&
					!fetchingSuggestions &&
					citySuggestions.length === 0 ? (
						<Text className="px-4 py-3 text-sm font-body text-typography-400 dark:text-zinc-400">
							<Trans id="onboarding.location.suggestionEmpty">
								Aucune suggestion disponible
							</Trans>
						</Text>
					) : null}
				</View>
			) : null}

			<View className="flex flex-col" style={{ gap: 12 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.location.country">Pays</Trans>
				</Text>
				<TextInput
					value={country}
					onChangeText={handleCountryChange}
					placeholder="France"
					autoCapitalize="words"
					autoComplete="country"
					className="rounded-2xl border border-outline-200 bg-white px-4 py-3 font-body text-base text-typography-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
