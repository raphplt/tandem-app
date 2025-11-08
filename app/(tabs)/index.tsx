import { useAuthSession } from "@/hooks/use-auth-session";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore } from "@/hooks/use-theme-store";
import { getDateWelcomeMessage } from "@/utils/time";
import { Trans } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
	CaretRightIcon,
	FlameIcon,
	LightningIcon,
	SparkleIcon,
	SunHorizonIcon,
} from "phosphor-react-native";
import { useCallback, useMemo } from "react";
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
	const { data: session, isLoading } = useAuthSession();
	const { mode } = useThemeStore();
	const colorScheme = useColorScheme();

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

	const appUser = session?.user as SessionUser | undefined;
	console.log("session.user:", session?.user);

	const firstName =
		typeof appUser?.firstName === "string" ? appUser.firstName : "Alex";
	const streak = typeof appUser?.streak === "number" ? appUser.streak : 7;
	const mood =
		typeof appUser?.mode === "string" ? appUser.mode : "Rencontres en douceur";
	const availability =
		typeof appUser?.status === "string" && appUser.status.trim().length
			? appUser.status
			: "Disponible pour matcher";

	const greeting = useMemo(() => {
		const hours = new Date().getHours();
		if (hours < 12) return "home-screen.greeting.morning";
		if (hours < 18) return "home-screen.greeting.afternoon";
		return "home-screen.greeting.evening";
	}, []);

	const handleMatchPress = useCallback(async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		Alert.alert("WeTwo", "Cette fonctionnalité arrive bientôt.");
	}, []);

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
					<View className="flex-1 justify-between gap-8">
						<HeroCard
							streak={streak}
							greetingKey={greeting}
							name={firstName}
							availability={availability}
						/>
						<View className="items-center">
							<MatchButton
								onPress={handleMatchPress}
								gradient={primaryGlow}
								shadowStyle={matchShadow}
								theme={resolvedTheme}
								borderColor={matchButtonBorderColor}
							/>
							<Text className="mt-8 text-center text-sm text-typography-600 dark:text-typography-300">
								<Trans id="home-screen.cta-hint">
									Une seule conversation par jour. Fais-en un moment sincère.
								</Trans>
							</Text>
						</View>
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
	availability,
}: {
	streak: number;
	greetingKey: string;
	name: string;
	availability: string;
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
			<View className="mt-6 flex-row items-center justify-between rounded-2xl border border-outline-100 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-black/30">
				<View>
					<Text className="text-[11px] uppercase tracking-[2px] text-typography-500 dark:text-typography-500">
						<Trans id="home-screen.status.label">Statut</Trans>
					</Text>
					<Text className="mt-1 text-sm text-typography-900 dark:text-typography-100">
						{availability}
					</Text>
				</View>
				<View className="items-end">
					<Text className="text-[11px] uppercase tracking-[2px] text-typography-500 dark:text-typography-500">
						<Trans id="home-screen.timer.label">Prochain créneau</Trans>
					</Text>
					<View className="mt-1 flex-row items-baseline gap-2">
						<Text className="text-lg font-semibold text-typography-900 dark:text-typography-white">
							14h12
						</Text>
						<Text className="text-xs text-typography-500 dark:text-typography-400">
							<Trans id="home-screen.timer.hint">après ta session</Trans>
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

function MatchButton({
	onPress,
	gradient,
	shadowStyle,
	theme,
	borderColor,
}: {
	onPress: () => void;
	gradient: GradientColors;
	shadowStyle: ViewStyle;
	theme: ThemeVariant;
	borderColor: string;
}) {
	const isDark = theme === "dark";
	const iconColor = isDark ? "#FFFFFF" : "#7A2742";

	return (
		<Pressable
			onPress={onPress}
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
					<View className="flex-row items-center gap-2">
						<LightningIcon size={36} weight="fill" color={iconColor} />
						<Text className="text-2xl font-semibold text-typography-900 dark:text-typography-white">
							<Trans id="home-screen.cta">Matcher</Trans>
						</Text>
					</View>
					<View className="mt-5 flex-row items-center gap-2 rounded-full bg-white/60 px-3 py-1 dark:bg-black/20">
						<SparkleIcon size={14} weight="fill" color={iconColor} />
						<Text className="text-[11px] tracking-[1.4px] text-typography-700 dark:text-typography-white/80">
							<Trans id="home-screen.cta-tag">Connection du jour</Trans>
						</Text>
					</View>
				</LinearGradient>
			</View>
		</Pressable>
	);
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

type SessionUser = {
	firstName?: unknown;
	streak?: unknown;
	mode?: unknown;
	status?: unknown;
	interests?: unknown;
};

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
