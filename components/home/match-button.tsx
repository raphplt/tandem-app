import { Trans } from "@lingui/react/macro";
import { LinearGradient } from "expo-linear-gradient";
import {
	LightningIcon,
	SparkleIcon,
} from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import type { ViewStyle } from "react-native";

import type {
	AvailabilityStatus,
	SearchStateEventPayload,
} from "@/types/availability";

import type { GradientColors, ThemeVariant } from "./types";

type MatchButtonProps = {
	onPress: () => void;
	gradient: GradientColors;
	shadowStyle: ViewStyle;
	theme: ThemeVariant;
	borderColor: string;
	isLoading?: boolean;
	isSearching?: boolean;
	searchState?: SearchStateEventPayload | null;
	isCancellingSearch?: boolean;
	errorMessage?: string | null;
};

export function MatchButton({
	onPress,
	gradient,
	shadowStyle,
	theme,
	borderColor,
	isLoading,
	isSearching = false,
	searchState,
	isCancellingSearch = false,
	errorMessage,
}: MatchButtonProps) {
	const isDark = theme === "dark";
	const iconColor = isDark ? "#FFFFFF" : "#7A2742";
	const queuedAt = isSearching ? searchState?.queuedAt ?? null : null;
	const durationLabel = useQueueDurationLabel(queuedAt);
	const statusLabel = getSearchStatusLabel(searchState?.status);
	const isDisabled = Boolean(isLoading || isCancellingSearch);

	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			accessibilityRole="button"
			className="active:scale-95"
		>
			<View className="items-center justify-center">
				<View className="absolute h-[260px] w-[260px] rounded-full bg-accentRose-100/60 blur-3xl dark:bg-accentRose-200/15" />
				<View className="absolute h-[240px] w-[240px] rounded-full border border-accentGold-200/50 bg-white/70 dark:border-white/5 dark:bg-accentGold-400/10" />
				<LinearGradient
					colors={gradient}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[styles.matchButton, shadowStyle, { borderColor }]}
				>
					{isSearching ? (
						<View className="w-fit">
							<View className="flex-row items-center justify-center gap-2">
								<ActivityIndicator color={iconColor} />
								<View className="items-center">
									<Text className="text-lg font-semibold text-typography-900 dark:text-typography-white">
										{statusLabel}
									</Text>
									{durationLabel ? (
										<Text className="mt-1 text-sm text-typography-700 dark:text-typography-200">
											<Trans id="home-screen.search.wait-time">
												En file depuis {durationLabel}
											</Trans>
										</Text>
									) : null}
								</View>
							</View>
							{searchState?.isOnline === false ? (
								<Text className="mt-3 text-xs text-error-500">
									<Trans id="home-screen.search.offline">
										On ne reçoit plus ton signal, reste sur l’écran pour conserver ta
										place.
									</Trans>
								</Text>
							) : null}
							{errorMessage ? (
								<Text className="mt-2 text-xs text-error-500">{errorMessage}</Text>
							) : null}
							<View className="mt-4 w-fit flex justify-center flex-row items-center gap-2 rounded-full bg-white/40 px-3 py-2 dark:bg-black/20">
								{isCancellingSearch ? (
									<ActivityIndicator size="small" color={iconColor} />
								) : (
									<SparkleIcon size={14} weight="fill" color={iconColor} />
								)}
								<Text className="text-[11px] tracking-[1.4px] text-typography-700 dark:text-typography-white/80">
									{isCancellingSearch ? (
										<Trans id="home-screen.search.cancel.loading">Annulation…</Trans>
									) : (
										<Trans id="home-screen.search.cancel">Annuler la recherche</Trans>
									)}
								</Text>
							</View>
						</View>
					) : isLoading ? (
						<View className="flex-row items-center gap-2">
							<ActivityIndicator color={iconColor} />
							<Text className="text-2xl font-semibold text-typography-900 dark:text-typography-white">
								<Trans id="home-screen.cta.loading">Recherche en cours</Trans>
							</Text>
						</View>
					) : (
						<View className="flex-row items-center gap-2">
							<LightningIcon size={36} weight="fill" color={iconColor} />
							<Text className="text-2xl font-semibold text-typography-900 dark:text-typography-white">
								<Trans id="home-screen.cta">Matcher</Trans>
							</Text>
						</View>
					)}
					{!isSearching ? (
						<View className="mt-5 flex-row items-center gap-2 rounded-full bg-white/60 px-3 py-1 dark:bg-black/20">
							<SparkleIcon size={14} weight="fill" color={iconColor} />
							<Text className="text-[11px] tracking-[1.4px] text-typography-700 dark:text-typography-white/80">
								<Trans id="home-screen.cta-tag">Connection du jour</Trans>
							</Text>
						</View>
					) : null}
				</LinearGradient>
			</View>
		</Pressable>
	);
}

function useQueueDurationLabel(queuedAt?: string | null) {
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		if (!queuedAt) {
			return;
		}
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, [queuedAt]);

	return useMemo(() => {
		if (!queuedAt) {
			return null;
		}
		const queuedDate = new Date(queuedAt);
		if (Number.isNaN(queuedDate.getTime())) {
			return null;
		}
		const diffMs = Math.max(0, now - queuedDate.getTime());
		const minutes = Math.floor(diffMs / 60000);
		const seconds = Math.floor((diffMs % 60000) / 1000);
		if (minutes > 0) {
			return `${minutes} min ${seconds.toString().padStart(2, "0")} s`;
		}
		return `${seconds} s`;
	}, [now, queuedAt]);
}

function getSearchStatusLabel(status?: AvailabilityStatus) {
	switch (status) {
		case "matched":
			return (
				<Trans id="home-screen.search.status.matched">
					Match trouvé ! Prépare-toi à faire connaissance.
				</Trans>
			);
		case "queued":
			return (
				<Trans id="home-screen.search.status.queued">
					Recherche en cours… on sélectionne ton duo du jour.
				</Trans>
			);
		case "idle":
			return (
				<Trans id="home-screen.search.status.idle">
					En attente. Lance ou relance la recherche quand tu veux.
				</Trans>
			);
		default:
			return (
				<Trans id="home-screen.search.status.generic">
					{status ?? "Recherche en cours..."}
				</Trans>
			);
	}
}

const styles = StyleSheet.create({
	matchButton: {
		height: 220,
		width: 220,
		borderRadius: 110,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.1)",
	},
});
