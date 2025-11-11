import { DailyMatchCard } from "@/components/home/daily-match-card";
import { HeroCard } from "@/components/home/hero-card";
import { MatchButton } from "@/components/home/match-button";
import { MoodCard } from "@/components/home/mood-card";
import type { GradientColors, ThemeVariant } from "@/components/home/types";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import {
	useActiveConversation,
	useCreateConversationFromMatch,
} from "@/src/hooks/use-conversations";
import { useDailySearchStream } from "@/src/hooks/use-daily-search-stream";
import {
	useAcceptMatch,
	useDailyMatch,
	useRejectMatch,
} from "@/src/hooks/use-matches";
import { useMyProfile } from "@/src/hooks/use-profiles";
import { extractErrorMessage } from "@/src/utils/error";
import type { MatchProfileSnapshot } from "@/types/match";
import { Trans } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import type { ViewStyle } from "react-native";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

	const { data: activeConversation } = useActiveConversation();
	const handleContinueChat = useCallback(async () => {
		if (!dailyMatch || !activeConversation) return;
		router.push(`/chat/${activeConversation.id}` as never);
	}, [dailyMatch, activeConversation, router]);

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
		<View className="flex-1 bg-background-0 dark:bg-background-950 pb-24">
			<LinearGradient
				colors={heroGradient}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFillObject}
			/>
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
								onContinueChat={handleContinueChat}
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
