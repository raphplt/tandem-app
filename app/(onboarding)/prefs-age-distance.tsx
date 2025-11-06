import { Trans } from "@lingui/react/macro";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { GestureResponderEvent, PanResponder, Text, View } from "react-native";

import {
	OnboardingGradientButton,
	OnboardingShell,
	StepIndicator,
} from "@/components/onboarding";
import { useOnboardingDraft } from "@/src/hooks/use-onboarding-draft";
import { useOnboardingStep } from "@/src/hooks/use-onboarding-step";
import {
	MAX_DISTANCE_KM,
	MAX_ONBOARDING_AGE,
	MIN_DISTANCE_KM,
	MIN_ONBOARDING_AGE,
	onboardingPreferencesSchema,
} from "@/src/lib/validations/onboarding";
import { extractErrorMessage } from "@/src/utils/error";

const THUMB_SIZE = 36;
const HALF_THUMB = THUMB_SIZE / 2;

const clampValue = (v: number, min: number, max: number) =>
	Math.min(Math.max(v, min), max);

const valueToX = (value: number, min: number, max: number, trackW: number) => {
	const range = max - min;
	if (!trackW || range <= 0) return HALF_THUMB;
	const usable = Math.max(trackW - THUMB_SIZE, 1);
	const ratio = (value - min) / range;
	return ratio * usable + HALF_THUMB;
};

const xToValue = (x: number, min: number, max: number, trackW: number) => {
	const range = max - min;
	if (!trackW || range <= 0) return min;
	const usable = Math.max(trackW - THUMB_SIZE, 1);
	const clamped = Math.min(Math.max(x - HALF_THUMB, 0), usable);
	const ratio = clamped / usable;
	return Math.round(min + ratio * range);
};

export default function PrefsAgeDistanceScreen() {
	const router = useRouter();
	const preferences = useOnboardingDraft((s) => s.preferences);
	const updatePreferences = useOnboardingDraft((s) => s.updatePreferences);
	const saveDraft = useOnboardingDraft((s) => s.saveDraft);
	const { trackContinue } = useOnboardingStep("prefs-age-distance");

	const [ageRange, setAgeRange] = useState<[number, number]>(() => {
		const min0 = preferences.ageMin ?? 25;
		const max0 = preferences.ageMax ?? 35;
		const min = clampValue(min0, MIN_ONBOARDING_AGE, MAX_ONBOARDING_AGE);
		const max = clampValue(
			Math.max(max0, min + 1),
			MIN_ONBOARDING_AGE,
			MAX_ONBOARDING_AGE
		);
		return [min, max];
	});

	const [distanceKm, setDistanceKm] = useState(() =>
		clampValue(preferences.distanceKm ?? 30, MIN_DISTANCE_KM, MAX_DISTANCE_KM)
	);

	const ageRangeRef = useRef(ageRange);
	const distanceRef = useRef(distanceKm);
	useEffect(() => {
		ageRangeRef.current = ageRange;
	}, [ageRange]);
	useEffect(() => {
		distanceRef.current = distanceKm;
	}, [distanceKm]);

	const [ageSliderWidth, setAgeSliderWidth] = useState(0);
	const [distanceSliderWidth, setDistanceSliderWidth] = useState(0);

	const sliderRange = MAX_ONBOARDING_AGE - MIN_ONBOARDING_AGE;
	const distanceRange = MAX_DISTANCE_KM - MIN_DISTANCE_KM;

	const ageMinStartValue = useRef(ageRange[0]);
	const ageMaxStartValue = useRef(ageRange[1]);
	const distanceStartValue = useRef(distanceKm);

	const ageMinPanResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onPanResponderGrant: () => {
					ageMinStartValue.current = ageRangeRef.current[0];
				},
				onPanResponderMove: (_, g) => {
					if (!ageSliderWidth) return;
					const usable = Math.max(ageSliderWidth - THUMB_SIZE, 1);
					const delta = Math.round((g.dx / usable) * sliderRange);
					const tentative = ageMinStartValue.current + delta;
					setAgeRange((prev) => {
						const nextMin = Math.min(
							Math.max(tentative, MIN_ONBOARDING_AGE),
							prev[1] - 1
						);
						return nextMin === prev[0] ? prev : [nextMin, prev[1]];
					});
				},
			}),
		[ageSliderWidth, sliderRange]
	);

	const ageMaxPanResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onPanResponderGrant: () => {
					ageMaxStartValue.current = ageRangeRef.current[1];
				},
				onPanResponderMove: (_, g) => {
					if (!ageSliderWidth) return;
					const usable = Math.max(ageSliderWidth - THUMB_SIZE, 1);
					const delta = Math.round((g.dx / usable) * sliderRange);
					const tentative = ageMaxStartValue.current + delta;
					setAgeRange((prev) => {
						const nextMax = Math.max(
							Math.min(tentative, MAX_ONBOARDING_AGE),
							prev[0] + 1
						);
						return nextMax === prev[1] ? prev : [prev[0], nextMax];
					});
				},
			}),
		[ageSliderWidth, sliderRange]
	);

	const distancePanResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onPanResponderGrant: () => {
					distanceStartValue.current = distanceRef.current;
				},
				onPanResponderMove: (_, g) => {
					if (!distanceSliderWidth) return;
					const usable = Math.max(distanceSliderWidth - THUMB_SIZE, 1);
					const delta = Math.round((g.dx / usable) * distanceRange);
					const tentative = distanceStartValue.current + delta;
					const next = clampValue(tentative, MIN_DISTANCE_KM, MAX_DISTANCE_KM);
					setDistanceKm((prev) => (prev === next ? prev : next));
				},
			}),
		[distanceRange, distanceSliderWidth]
	);

	const handleAgeTrackPress = (e: GestureResponderEvent) => {
		if (!ageSliderWidth) return;
		const value = xToValue(
			e.nativeEvent.locationX,
			MIN_ONBOARDING_AGE,
			MAX_ONBOARDING_AGE,
			ageSliderWidth
		);
		setAgeRange((prev) => {
			const dMin = Math.abs(value - prev[0]);
			const dMax = Math.abs(value - prev[1]);
			if (dMin <= dMax) {
				const nextMin = Math.min(Math.max(value, MIN_ONBOARDING_AGE), prev[1] - 1);
				return [nextMin, prev[1]];
			}
			const nextMax = Math.max(Math.min(value, MAX_ONBOARDING_AGE), prev[0] + 1);
			return [prev[0], nextMax];
		});
	};

	const handleDistanceTrackPress = (e: GestureResponderEvent) => {
		if (!distanceSliderWidth) return;
		const next = xToValue(
			e.nativeEvent.locationX,
			MIN_DISTANCE_KM,
			MAX_DISTANCE_KM,
			distanceSliderWidth
		);
		setDistanceKm(next);
	};

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isContinueDisabled = useMemo(
		() =>
			loading ||
			!Number.isFinite(ageRange[0]) ||
			!Number.isFinite(ageRange[1]) ||
			!Number.isFinite(distanceKm),
		[ageRange, distanceKm, loading]
	);

	const handleContinue = async () => {
		setError(null);
		setLoading(true);
		const validation = onboardingPreferencesSchema.safeParse({
			ageMin: ageRange[0],
			ageMax: ageRange[1],
			distanceKm,
		});
		if (!validation.success) {
			setLoading(false);
			setError(validation.error.issues[0]?.message ?? null);
			return;
		}
		updatePreferences(validation.data);
		try {
			await saveDraft({ preferences: validation.data });
			trackContinue(validation.data);
			router.push("/(onboarding)/interests");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const xAgeMin = valueToX(
		ageRange[0],
		MIN_ONBOARDING_AGE,
		MAX_ONBOARDING_AGE,
		ageSliderWidth
	);
	const xAgeMax = valueToX(
		ageRange[1],
		MIN_ONBOARDING_AGE,
		MAX_ONBOARDING_AGE,
		ageSliderWidth
	);

	const hit = { top: 12, bottom: 12, left: 12, right: 12 } as const;

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
					accessibilityLabel="Continuer vers tes centres d'intérêt"
				/>
			}
		>
			<View className="flex flex-col" style={{ gap: 8 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.preferences.ageRange">
						Tranche d&apos;âge recherchée
					</Trans>
				</Text>

				<View className="rounded-3xl border border-outline-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
					<View className="flex-row items-center justify-between">
						<Text className="text-sm font-semibold uppercase tracking-wider text-typography-400 dark:text-zinc-500">
							<Trans id="onboarding.preferences.ageRange.current">Actuellement</Trans>
						</Text>
						<View className="flex-row items-baseline">
							<Text className="text-2xl font-semibold text-typography-900 dark:text-zinc-100">
								{ageRange[0]}
							</Text>
							<Text className="mx-1 text-xl font-semibold text-typography-400 dark:text-zinc-400">
								-
							</Text>
							<Text className="text-2xl font-semibold text-typography-900 dark:text-zinc-100">
								{ageRange[1]}
							</Text>
							<Text className="ml-2 text-sm font-semibold uppercase text-typography-500 dark:text-zinc-500">
								<Trans id="onboarding.preferences.ageRange.years">ans</Trans>
							</Text>
						</View>
					</View>

					<View
						className="mt-5"
						onStartShouldSetResponder={() => true}
						onResponderGrant={handleAgeTrackPress}
						onResponderMove={handleAgeTrackPress}
						onResponderTerminationRequest={() => false}
					>
						<View
							className="h-[52px]"
							onLayout={(e) => setAgeSliderWidth(e.nativeEvent.layout.width)}
							style={{ justifyContent: "center" }}
						>
							<View className="h-2 rounded-full bg-outline-200 dark:bg-zinc-700" />

							{ageSliderWidth > 0 ? (
								<>
									<View
										className="absolute top-1/2 h-2 overflow-hidden rounded-full"
										style={{
											left: xAgeMin,
											width: Math.max(xAgeMax - xAgeMin, 0),
											transform: [{ translateY: -4 }],
										}}
										pointerEvents="none"
									>
										<LinearGradient
											colors={["#D6A53A", "#E08AA4", "#9A6A00"]}
											start={{ x: 0, y: 0.5 }}
											end={{ x: 1, y: 0.5 }}
											style={{ width: "100%", height: "100%" }}
										/>
									</View>

									<View
										className="absolute"
										style={{
											left: xAgeMin,
											top: "50%",
											width: THUMB_SIZE,
											height: THUMB_SIZE,
											transform: [
												{ translateX: -HALF_THUMB },
												{ translateY: -HALF_THUMB },
											],
										}}
										{...ageMinPanResponder.panHandlers}
									>
										<View
											pointerEvents="none"
											style={{
												position: "absolute",
												bottom: THUMB_SIZE + 6,
												left: 0,
												right: 0,
												alignItems: "center",
											}}
										>
											<Text className="text-xs font-semibold text-typography-500 dark:text-zinc-300">
												{ageRange[0]}{" "}
												<Trans id="onboarding.preferences.ageRange.yearsShort">ans</Trans>
											</Text>
										</View>

										<View
											className="h-9 w-9 items-center justify-center rounded-full border-2 border-amber-400 bg-white shadow-lg dark:bg-zinc-800"
											hitSlop={hit}
										>
											<View className="h-3 w-3 rounded-full bg-amber-500" />
										</View>
									</View>

									<View
										className="absolute"
										style={{
											left: xAgeMax,
											top: "50%",
											width: THUMB_SIZE,
											height: THUMB_SIZE,
											transform: [
												{ translateX: -HALF_THUMB },
												{ translateY: -HALF_THUMB },
											],
										}}
										{...ageMaxPanResponder.panHandlers}
									>
										<View
											pointerEvents="none"
											style={{
												position: "absolute",
												bottom: THUMB_SIZE + 6,
												left: 0,
												right: 0,
												alignItems: "center",
											}}
										>
											<Text className="text-xs font-semibold text-typography-500 dark:text-zinc-300">
												{ageRange[1]}{" "}
												<Trans id="onboarding.preferences.ageRange.yearsShort">ans</Trans>
											</Text>
										</View>

										<View
											className="h-9 w-9 items-center justify-center rounded-full border-2 border-pink-400 bg-white shadow-lg dark:bg-zinc-800"
											hitSlop={hit}
										>
											<View className="h-3 w-3 rounded-full bg-pink-500" />
										</View>
									</View>
								</>
							) : null}
						</View>
					</View>

					<View className="mt-4 flex-row justify-between">
						<Text className="text-xs font-semibold uppercase text-typography-400 dark:text-zinc-500">
							{MIN_ONBOARDING_AGE}
						</Text>
						<Text className="text-xs font-semibold uppercase text-typography-400 dark:text-zinc-500">
							{MAX_ONBOARDING_AGE}
						</Text>
					</View>
				</View>
			</View>

			<View className="flex flex-col" style={{ gap: 8 }}>
				<Text className="text-sm font-body text-typography-500 dark:text-zinc-400">
					<Trans id="onboarding.preferences.distance">Distance maximale (km)</Trans>
				</Text>

				<View className="rounded-3xl border border-outline-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
					<View className="flex-row items-center justify-between">
						<View>
							<Text className="text-sm font-semibold uppercase tracking-wider text-typography-400 dark:text-zinc-500">
								<Trans id="onboarding.preferences.distance.current">Périmètre</Trans>
							</Text>
							<Text className="text-3xl font-semibold text-typography-900 dark:text-zinc-100">
								{distanceKm} km
							</Text>
						</View>
						<View className="rounded-full bg-amber-100 px-3 py-1 dark:bg-amber-900/30">
							<Text className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-300">
								<Trans id="onboarding.preferences.distance.vibes">Spots proches</Trans>
							</Text>
						</View>
					</View>

					<View
						className="mt-5"
						onStartShouldSetResponder={() => true}
						onResponderGrant={handleDistanceTrackPress}
						onResponderMove={handleDistanceTrackPress}
						onResponderTerminationRequest={() => false}
					>
						<View
							className="h-[52px]"
							onLayout={(e) => setDistanceSliderWidth(e.nativeEvent.layout.width)}
							style={{ justifyContent: "center" }}
						>
							<View className="h-2 rounded-full bg-outline-200 dark:bg-zinc-700" />

							{distanceSliderWidth > 0 ? (
								<>
									<View
										className="absolute top-1/2 h-2 overflow-hidden rounded-full"
										style={{
											left: HALF_THUMB,
											width: Math.max(
												valueToX(
													distanceKm,
													MIN_DISTANCE_KM,
													MAX_DISTANCE_KM,
													distanceSliderWidth
												) - HALF_THUMB,
												0
											),
											transform: [{ translateY: -4 }],
										}}
										pointerEvents="none"
									>
										<LinearGradient
											colors={["#E08AA4", "#9A6A00"]}
											start={{ x: 0, y: 0.5 }}
											end={{ x: 1, y: 0.5 }}
											style={{ width: "100%", height: "100%" }}
										/>
									</View>

									<View
										className="absolute"
										style={{
											left: valueToX(
												distanceKm,
												MIN_DISTANCE_KM,
												MAX_DISTANCE_KM,
												distanceSliderWidth
											),
											top: "50%",
											width: THUMB_SIZE,
											height: THUMB_SIZE,
											transform: [
												{ translateX: -HALF_THUMB },
												{ translateY: -HALF_THUMB },
											],
										}}
										{...distancePanResponder.panHandlers}
									>
										<View
											pointerEvents="none"
											style={{
												position: "absolute",
												bottom: THUMB_SIZE + 6,
												left: 0,
												right: 0,
												alignItems: "center",
											}}
										>
											<Text className="text-xs font-semibold text-typography-500 dark:text-zinc-300">
												{distanceKm} km
											</Text>
										</View>

										<View
											className="h-9 w-9 items-center justify-center rounded-full border-2 border-amber-400 bg-white shadow-lg dark:bg-zinc-800"
											hitSlop={hit}
										>
											<View className="h-3 w-3 rounded-full bg-amber-500" />
										</View>
									</View>
								</>
							) : null}
						</View>
					</View>

					<View className="mt-4 flex-row justify-between">
						<Text className="text-xs font-semibold uppercase text-typography-400 dark:text-zinc-500">
							{MIN_DISTANCE_KM} km
						</Text>
						<Text className="text-xs font-semibold uppercase text-typography-400 dark:text-zinc-500">
							{MAX_DISTANCE_KM} km
						</Text>
					</View>
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
