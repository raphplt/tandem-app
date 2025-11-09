import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useCreateConversationFromMatch } from "@/src/hooks/use-conversations";
import { useDailySearchStream } from "@/src/hooks/use-daily-search-stream";
import {
	useAcceptMatch,
	useDailyMatch,
	useRejectMatch,
} from "@/src/hooks/use-matches";
import { useMyProfile } from "@/src/hooks/use-profiles";
import { extractErrorMessage } from "@/src/utils/error";
import type {
	AvailabilityStatus,
	SearchStateEventPayload,
} from "@/types/availability";
import type { MatchProfileSnapshot, MatchResponse } from "@/types/match";
import { getDateWelcomeMessage } from "@/utils/time";
import { Trans } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
	CaretRightIcon,
	FlameIcon,
	LightningIcon,
	SparkleIcon,
	SunHorizonIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColorValue, ViewStyle } from "react-native";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type GradientColors = [ColorValue, ColorValue, ...ColorValue[]];

type ThemeVariant = "light" | "dark";

const heroGradients: Record<ThemeVariant, GradientColors> = {
	dark: ["#0A0A0B", "#121315", "#7A5400"],
	light: ["#FFF9F5", "#FFF1E6", "#F3B3C8"],
};

const primaryGlowGradients: Record<ThemeVariant, GradientColors> = {
	dark: ["#F3B3C8", "#F8E9B8", "#D6A53A"],
	light: ["#F7C5D8", "#FFE2AF", "#E6BF63"],
};

const matchButtonShadows: Record<ThemeVariant, ViewStyle> = {
	dark: {
		shadowColor: "#CF9A56",
		shadowOpacity: 0.45,
		shadowRadius: 28,
		shadowOffset: { width: 0, height: 18 },
	},
	light: {
		shadowColor: "#D6A53A",
		shadowOpacity: 0.3,
		shadowRadius: 24,
		shadowOffset: { width: 0, height: 16 },
	},
};

export default function HomeScreen() {
	const { data: appUser, isLoading } = useMyProfile();
	const { mode } = useThemeStore();
	const colorScheme = useColorScheme();
	const { data: session } = useAuthSession();
	const router = useRouter();
	const {
		isSearching,
		searchState,
		startSearch,
		cancelSearch,
		error: searchStreamError,
	} = useDailySearchStream();
	const [isCancellingSearch, setIsCancellingSearch] = useState(false);

	const {
		data: dailyMatch,
		isLoading: isDailyMatchLoading,
		isRefetching: isDailyMatchRefetching,
		refetch: refetchDailyMatch,
	} = useDailyMatch();
	const { mutateAsync: acceptMatchMutation, isPending: isAccepting } =
		useAcceptMatch();
	const { mutateAsync: rejectMatchMutation, isPending: isRejecting } =
		useRejectMatch();
	const {
		mutateAsync: createConversationFromMatch,
		isPending: isStartingConversation,
	} = useCreateConversationFromMatch();
	const matchButtonIsLoading = isDailyMatchLoading || isDailyMatchRefetching;

	const resolvedTheme: ThemeVariant =
		(mode === "system" ? colorScheme ?? "light" : mode) === "dark"
			? "dark"
			: "light";
	const heroGradient = heroGradients[resolvedTheme];
	const primaryGlow = primaryGlowGradients[resolvedTheme];
	const matchShadow = matchButtonShadows[resolvedTheme];
	const matchButtonBorderColor =
		resolvedTheme === "dark"
			? "rgba(255,255,255,0.1)"
			: "rgba(122, 39, 66, 0.25)";
	const statusBarStyle = resolvedTheme === "dark" ? "light" : "dark";

	const firstName = (appUser?.firstName as string | undefined) ?? "Utilisateur";

	//TODO : fetch real streak and mood from user profile
	const streak = 7;
	const mood = "Rencontres en douceur";

	const greeting = useMemo(() => {
		const hours = new Date().getHours();
		if (hours < 12) return "home-screen.greeting.morning";
		if (hours < 18) return "home-screen.greeting.afternoon";
		return "home-screen.greeting.evening";
	}, []);

	const handleCancelSearch = useCallback(async () => {
		setIsCancellingSearch(true);
		try {
			await cancelSearch();
		} catch (error) {
			Alert.alert("WeTwo", extractErrorMessage(error));
		} finally {
			setIsCancellingSearch(false);
		}
	}, [cancelSearch]);

	const handleMatchPress = useCallback(async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		if (isSearching) {
			if (!isCancellingSearch) {
				await handleCancelSearch();
			}
			return;
		}
		try {
			if (dailyMatch) {
				await refetchDailyMatch();
				return;
			}
			await startSearch();
		} catch (error) {
			Alert.alert("WeTwo", extractErrorMessage(error));
		}
	}, [
		dailyMatch,
		handleCancelSearch,
		isCancellingSearch,
		isSearching,
		refetchDailyMatch,
		startSearch,
	]);

	const handleAcceptMatch = useCallback(async () => {
		if (!dailyMatch) return;
		try {
			const updatedMatch = await acceptMatchMutation(dailyMatch.id);
			if (updatedMatch.isMutual || updatedMatch.isAccepted) {
				const conversation = await createConversationFromMatch(updatedMatch.id);
				router.push(`/chat/${conversation.id}` as never);
			}
		} catch (error) {
			Alert.alert("WeTwo", extractErrorMessage(error));
		}
	}, [acceptMatchMutation, createConversationFromMatch, dailyMatch, router]);

	const handleRejectMatch = useCallback(async () => {
		if (!dailyMatch) return;
		try {
			await rejectMatchMutation({ matchId: dailyMatch.id });
		} catch (error) {
			Alert.alert("WeTwo", extractErrorMessage(error));
		}
	}, [dailyMatch, rejectMatchMutation]);

	const handleStartConversation = useCallback(async () => {
		if (!dailyMatch) return;
		try {
			const conversation = await createConversationFromMatch(dailyMatch.id);
			router.push(`/chat/${conversation.id}` as never);
		} catch (error) {
			Alert.alert("WeTwo", extractErrorMessage(error));
		}
	}, [createConversationFromMatch, dailyMatch, router]);

	const currentUserId = session?.user?.id;

	const partnerProfile = useMemo<MatchProfileSnapshot | null>(() => {
		if (!dailyMatch || !currentUserId) {
			return dailyMatch?.profile1 ?? dailyMatch?.profile2 ?? null;
		}
		const isUser1 = dailyMatch.user1Id === currentUserId;
		return (isUser1 ? dailyMatch.profile2 : dailyMatch.profile1) ?? null;
	}, [currentUserId, dailyMatch]);

	const waitingForPartner = useMemo(() => {
		if (!dailyMatch || !currentUserId) return false;
		const isUser1 = dailyMatch.user1Id === currentUserId;
		const meAccepted = isUser1
			? Boolean(dailyMatch.user1AcceptedAt)
			: Boolean(dailyMatch.user2AcceptedAt);
		const partnerAccepted = isUser1
			? Boolean(dailyMatch.user2AcceptedAt)
			: Boolean(dailyMatch.user1AcceptedAt);
		return meAccepted && !partnerAccepted;
	}, [currentUserId, dailyMatch]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background-0 dark:bg-background-950">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background-0 dark:bg-background-950">
			<LinearGradient
				colors={heroGradient}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFillObject}
			/>
			{/* <View className="absolute inset-x-[-80px] top-24 h-72 rounded-full bg-accentRose-300/20 blur-3xl" /> */}
			<StatusBar style={statusBarStyle} />
			<SafeAreaView className="flex-1">
				<View className="flex-1 justify-between gap-5 px-6 pb-8 pt-6">
					<HeroCard streak={streak} greetingKey={greeting} name={firstName} />
					<View className="flex flex-col gap-4">
						{dailyMatch ? (
							<DailyMatchCard
								match={dailyMatch}
								partner={partnerProfile}
								onAccept={handleAcceptMatch}
								onReject={handleRejectMatch}
								onStartChat={handleStartConversation}
								isAccepting={isAccepting}
								isRejecting={isRejecting}
								isStartingConversation={isStartingConversation}
								waitingForPartner={waitingForPartner}
							/>
						) : (
							<MatchButton
								onPress={handleMatchPress}
								gradient={primaryGlow}
								shadowStyle={matchShadow}
								theme={resolvedTheme}
								borderColor={matchButtonBorderColor}
								isLoading={matchButtonIsLoading}
								isSearching={isSearching}
								searchState={searchState}
								isCancellingSearch={isCancellingSearch}
								errorMessage={searchStreamError}
							/>
						)}

						<Text className="mt-8 text-center text-sm text-typography-600 dark:text-typography-300">
							<Trans id="home-screen.cta-hint">
								Une seule conversation par jour. Fais-en un moment sincère.
							</Trans>
						</Text>
					</View>
					<View className="mt-4 flex flex-col gap-4">
						<MoodCard mood={mood} />
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}

function HeroCard({
	streak,
	greetingKey,
	name,
}: {
	streak: number;
	greetingKey: string;
	name: string;
}) {
	return (
		<View className="overflow-hidden rounded-[32px] border border-outline-100 bg-white/95 p-6 dark:border-white/10 dark:bg-white/5">
			<View className="flex-row items-center gap-2">
				<FlameIcon size={18} weight="fill" color="#E08AA4" />
				<Text className="text-xs uppercase tracking-[2px] text-typography-500 dark:text-typography-400">
					{streak} jours
				</Text>
			</View>
			<Text className="mt-5 font-heading text-[34px] leading-tight text-typography-900 dark:text-typography-white">
				<Trans id={greetingKey}>
					{getDateWelcomeMessage(new Date())}, {name} !
				</Trans>
			</Text>
			<Text className="mt-3 text-base text-typography-600 dark:text-typography-200">
				<Trans id="home-screen.subtitle">
					C&apos;est le moment de ta rencontre du jour.
				</Trans>
			</Text>
		</View>
	);
}

function MatchButton({
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
}: {
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
}) {
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

function MoodCard({ mood }: { mood: string }) {
	return (
		<View className="overflow-hidden rounded-[28px] border border-outline-100 bg-white/95 p-6 dark:border-white/10 dark:bg-black/40">
			<View className="flex-row items-center justify-between">
				<View>
					<Text className="text-[11px] uppercase tracking-[2px] text-typography-500 dark:text-typography-400">
						<Trans id="home-screen.mode.label">Ton mode</Trans>
					</Text>
					<Text className="mt-2 text-xl text-typography-900 dark:text-typography-white">
						{mood}
					</Text>
				</View>
				<View className="rounded-full bg-background-100 p-3 dark:bg-white/5">
					<SunHorizonIcon size={22} weight="bold" color="#E6BF63" />
				</View>
			</View>
			<View className="mt-4 flex-row items-center gap-2">
				<Text className="text-xs text-typography-600 dark:text-typography-400">
					<Trans id="home-screen.mode.hint">
						Ajuste tes intentions dans tes préférences.
					</Trans>
				</Text>
				<CaretRightIcon size={16} weight="bold" color="#E08AA4" />
			</View>
		</View>
	);
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

function DailyMatchCard({
	match,
	partner,
	onAccept,
	onReject,
	onStartChat,
	isAccepting,
	isRejecting,
	isStartingConversation,
	waitingForPartner,
}: {
	match: MatchResponse;
	partner: MatchProfileSnapshot | null;
	onAccept: () => void;
	onReject: () => void;
	onStartChat: () => void;
	isAccepting: boolean;
	isRejecting: boolean;
	isStartingConversation: boolean;
	waitingForPartner: boolean;
}) {
	const name = partner?.firstName ?? "Ton match";
	const secondaryLine = [
		partner?.age ? `${partner.age} ans` : null,
		partner?.city,
		partner?.country,
	]
		.filter(Boolean)
		.join(" • ");

	const chipsSource =
		(partner?.values && partner.values.length > 0 && partner.values) ||
		(partner?.interests && partner.interests.length > 0 && partner.interests) ||
		[];
	const chips = chipsSource ? chipsSource.slice(0, 3) : [];

	const statusLabel = getMatchStatusLabel(match, waitingForPartner);
	const expiresIn = formatTimeUntilExpiry(match.timeUntilExpiry);
	const canChat = match.isAccepted || match.isMutual;

	return (
		<View className="rounded-3xl border border-outline-100 bg-white/95 p-6 dark:border-white/10 dark:bg-white/5">
			<Text className="text-xs uppercase tracking-[2px] text-typography-500 dark:text-typography-400">
				<Trans id="daily-match.header">Rencontre du jour</Trans>
			</Text>
			<View className="mt-4 flex-row items-center gap-4">
				<Avatar name={name} photoUrl={partner?.photoUrl} />
				<View className="flex-1">
					<Text className="text-2xl font-heading text-typography-900 dark:text-typography-white">
						{name}
					</Text>
					{secondaryLine ? (
						<Text className="text-sm text-typography-600 dark:text-typography-300">
							{secondaryLine}
						</Text>
					) : null}
				</View>
				<View className="items-end">
					<Text className="text-xs uppercase text-typography-500 dark:text-typography-400">
						<Trans id="daily-match.score">Affinité</Trans>
					</Text>
					<Text className="text-3xl font-semibold text-accentRose-600 dark:text-accentRose-300">
						{Math.round(match.compatibilityScore)}%
					</Text>
				</View>
			</View>

			{chips.length > 0 ? (
				<View className="mt-4 flex-row flex-wrap gap-2">
					{chips.map((chip) => (
						<View
							key={chip}
							className="rounded-full border border-accentGold-200/60 bg-accentGold-50/60 px-3 py-1 dark:border-accentGold-800/60 dark:bg-accentGold-900/20"
						>
							<Text className="text-xs font-semibold uppercase tracking-[1px] text-accentGold-700 dark:text-accentGold-200">
								{chip}
							</Text>
						</View>
					))}
				</View>
			) : null}

			<View className="mt-4 rounded-2xl border border-outline-100/60 bg-background-light/80 px-4 py-3 dark:border-white/5 dark:bg-white/5">
				<Text className="text-xs uppercase tracking-[1.2px] text-typography-500 dark:text-typography-300">
					{statusLabel}
				</Text>
				<Text className="mt-1 text-sm text-typography-700 dark:text-typography-200">
					<Trans id="daily-match.expires-in">
						Expire dans {expiresIn ?? "24h"}.
					</Trans>
				</Text>
			</View>

			<View className="mt-5 flex-row gap-3">
				{!match.isAccepted && !waitingForPartner ? (
					<>
						<MatchActionButton
							label={<Trans id="daily-match.reject">Passer</Trans>}
							onPress={onReject}
							variant="ghost"
							loading={isRejecting}
						/>
						<MatchActionButton
							label={<Trans id="daily-match.accept">Accepter</Trans>}
							onPress={onAccept}
							loading={isAccepting}
						/>
					</>
				) : null}
				{waitingForPartner ? (
					<View className="flex-1 rounded-2xl border border-dashed border-outline-200 px-4 py-3">
						<Text className="text-sm text-typography-600 dark:text-typography-300">
							<Trans id="daily-match.waiting">
								En attente de la réponse de ton match.
							</Trans>
						</Text>
					</View>
				) : null}
				{canChat ? (
					<MatchActionButton
						label={<Trans id="daily-match.start-chat">Commencer à discuter</Trans>}
						onPress={onStartChat}
						loading={isStartingConversation}
						icon={<LightningIcon size={20} color="#FFFFFF" weight="fill" />}
					/>
				) : null}
			</View>
		</View>
	);
}

function Avatar({
	name,
	photoUrl,
}: {
	name: string;
	photoUrl?: string | null;
}) {
	const initials = name
		.split(" ")
		.map((part) => part.charAt(0).toUpperCase())
		.slice(0, 2)
		.join("");

	return (
		<View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-outline-100 bg-background-muted dark:border-white/10 dark:bg-white/10">
			{photoUrl ? (
				<Image source={{ uri: photoUrl }} style={{ width: "100%", height: "100%" }} />
			) : (
				<Text className="text-xl font-semibold text-typography-900 dark:text-typography-white">
					{initials}
				</Text>
			)}
		</View>
	);
}

function MatchActionButton({
	label,
	onPress,
	variant = "solid",
	loading,
	icon,
}: {
	label: React.ReactNode;
	onPress: () => void;
	variant?: "solid" | "ghost";
	loading?: boolean;
	icon?: React.ReactNode;
}) {
	const baseClasses =
		"flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3 transition-all duration-150 active:scale-[0.98]";
	const solidClasses =
		"bg-typography-900 dark:bg-white text-white dark:text-typography-900";
	const ghostClasses =
		"border border-outline-200 bg-white/80 text-typography-900 dark:border-white/20 dark:bg-white/5 dark:text-white";
	const className =
		variant === "solid" ? `${baseClasses} ${solidClasses}` : `${baseClasses} ${ghostClasses}`;

	return (
		<Pressable
			onPress={onPress}
			disabled={loading}
			className={className}
		>
			{loading ? (
				<ActivityIndicator color={variant === "solid" ? "#FFFFFF" : undefined} />
			) : (
				<View className="flex-row items-center gap-2">
					{icon}
					<Text
						className={
							variant === "solid"
								? "font-semibold text-white"
								: "font-semibold text-typography-900 dark:text-white"
						}
					>
						{label}
					</Text>
				</View>
			)}
		</Pressable>
	);
}

function formatTimeUntilExpiry(hoursLeft?: number) {
	if (typeof hoursLeft !== "number") return null;
	const hours = Math.floor(hoursLeft);
	const minutes = Math.max(0, Math.round((hoursLeft - hours) * 60));
	if (hours <= 0 && minutes <= 0) {
		return "quelques instants";
	}
	if (hours === 0) {
		return `${minutes} min`;
	}
	if (minutes === 0) {
		return `${hours} h`;
	}
	return `${hours} h ${minutes} min`;
}

function getMatchStatusLabel(match: MatchResponse, waitingForPartner: boolean) {
	if (match.isRejected) {
		return <Trans id="daily-match.status.rejected">Match refusé</Trans>;
	}
	if (match.isAccepted) {
		return <Trans id="daily-match.status.accepted">Connexion prête</Trans>;
	}
	if (waitingForPartner) {
		return (
			<Trans id="daily-match.status.waiting-partner">
				En attente de ton match
			</Trans>
		);
	}
	return <Trans id="daily-match.status.pending">Réponse attendue</Trans>;
}
