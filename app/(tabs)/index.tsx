import { useAuthSession } from "@/hooks/use-auth-session";
import { Trans } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
	CaretRight,
	Flame,
	Lightning,
	Sparkle,
	SunHorizon,
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

const heroGradient: GradientColors = ["#0A0A0B", "#121315", "#7A5400"];
const primaryGlow: GradientColors = ["#F3B3C8", "#F8E9B8", "#D6A53A"];
const reflectionGlow: GradientColors = [
	"rgba(248, 233, 184, 0.28)",
	"rgba(224, 138, 164, 0.32)",
	"rgba(154, 106, 0, 0.30)",
];

export default function HomeScreen() {
	const { data: session, isLoading } = useAuthSession();
	const appUser = session?.user as SessionUser | undefined;
	const firstName =
		typeof appUser?.firstName === "string" ? appUser.firstName : "Alex";
	const streak = typeof appUser?.streak === "number" ? appUser.streak : 7;
	const mood =
		typeof appUser?.mode === "string" ? appUser.mode : "Rencontres en douceur";
	const availability =
		typeof appUser?.status === "string" && appUser.status.trim().length
			? appUser.status
			: "Disponible pour matcher";

	const interests = useMemo(() => {
		const rawInterests = Array.isArray(appUser?.interests)
			? appUser.interests
			: [];
		const normalized = rawInterests.filter(
			(interest): interest is string => typeof interest === "string"
		);
		if (normalized.length) {
			return normalized.slice(0, 4);
		}
		return ["Lecture", "Voyage", "Musique", "+1"];
	}, [appUser?.interests]);

	const greeting = useMemo(() => {
		const hours = new Date().getHours();
		if (hours < 12) return "home-screen.greeting.morning";
		if (hours < 18) return "home-screen.greeting.afternoon";
		return "home-screen.greeting.evening";
	}, []);

	const handleMatchPress = useCallback(async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		Alert.alert("Solow", "Cette fonctionnalité arrive bientôt.");
	}, []);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background-950">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background-950">
			<LinearGradient
				colors={heroGradient}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFillObject}
			/>
			{/* <View className="absolute inset-x-[-80px] top-24 h-72 rounded-full bg-accentRose-300/20 blur-3xl" /> */}
			<StatusBar style="light" />
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
							<MatchButton onPress={handleMatchPress} />
							<Text className="mt-8 text-center text-sm text-typography-300">
								<Trans id="home-screen.cta-hint">
									Une seule conversation par jour. Fais-en un moment sincère.
								</Trans>
							</Text>
						</View>
					</View>
					<View className="flex flex-col gap-4 mt-4">
						<MoodCard mood={mood} />
						{/* <InterestsCard interests={interests} /> */}
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
		<View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6">
			<View className="flex-row items-center gap-2">
				<Flame size={18} weight="fill" color="#E08AA4" />
				<Text className="text-xs uppercase tracking-[2px] text-typography-400">
					{streak} jours
				</Text>
			</View>
			<Text className="mt-5 font-heading text-[34px] leading-tight text-typography-white">
				<Trans id={greetingKey}>Bonsoir</Trans>, {name}
			</Text>
			<Text className="mt-3 text-base text-typography-200">
				<Trans id="home-screen.subtitle">
					C&apos;est le moment de ta rencontre du jour.
				</Trans>
			</Text>
			<View className="mt-6 flex-row items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
				<View>
					<Text className="text-[11px] uppercase tracking-[2px] text-typography-500">
						<Trans id="home-screen.status.label">Statut</Trans>
					</Text>
					<Text className="mt-1 text-sm text-typography-100">{availability}</Text>
				</View>
				<View className="items-end">
					<Text className="text-[11px] uppercase tracking-[2px] text-typography-500">
						<Trans id="home-screen.timer.label">Prochain créneau</Trans>
					</Text>
					<View className="mt-1 flex-row items-baseline gap-2">
						<Text className="text-lg font-semibold text-typography-white">14h12</Text>
						<Text className="text-xs text-typography-400">
							<Trans id="home-screen.timer.hint">après ta session</Trans>
						</Text>
					</View>
				</View>
			</View>
		</View>
	);
}

function MatchButton({ onPress }: { onPress: () => void }) {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			className="active:scale-95"
		>
			<View className="items-center justify-center">
				<View className="absolute h-[260px] w-[260px] rounded-full bg-accentRose-200/15 blur-3xl" />
				<View className="absolute h-[240px] w-[240px] rounded-full border border-white/5 bg-accentGold-400/10" />
				<LinearGradient
					colors={primaryGlow}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[styles.matchButton, matchShadow]}
				>
					<View className="flex-row items-center gap-2">
						<Lightning size={36} weight="fill" color="#FFFFFF" />
						<Text className="text-2xl font-semibold text-typography-white">
							<Trans id="home-screen.cta">Matcher</Trans>
						</Text>
					</View>
					<View className="mt-5 flex-row items-center gap-2 rounded-full bg-black/20 px-3 py-1">
						<Sparkle size={14} weight="fill" color="#FFFFFF" />
						<Text className="text-[11px] tracking-[1.4px] text-typography-white/80">
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
		<View className="overflow-hidden rounded-[28px] border border-white/10 bg-black/40 p-6">
			<View className="flex-row items-center justify-between">
				<View>
					<Text className="text-[11px] uppercase tracking-[2px] text-typography-500">
						<Trans id="home-screen.mode.label">Ton mode</Trans>
					</Text>
					<Text className="mt-2 text-xl text-typography-white">{mood}</Text>
				</View>
				<View className="rounded-full bg-white/5 p-3">
					<SunHorizon size={22} weight="bold" color="#E6BF63" />
				</View>
			</View>
			<View className="mt-4 flex-row items-center gap-2">
				<Text className="text-xs text-typography-400">
					<Trans id="home-screen.mode.hint">
						Ajuste tes intentions dans tes préférences.
					</Trans>
				</Text>
				<CaretRight size={16} weight="bold" color="#E08AA4" />
			</View>
		</View>
	);
}

function InterestsCard({ interests }: { interests: string[] }) {
	const palettes = [
		"bg-accentRose-500/20",
		"bg-accentGold-400/20",
		"bg-tertiary-500/20",
	];
	return (
		<View className="overflow-hidden rounded-[28px] border border-white/10 bg-black/40 p-6">
			<Text className="text-[11px] uppercase tracking-[2px] text-typography-500">
				<Trans id="home-screen.interests.label">Tes centres d&apos;intérêt</Trans>
			</Text>
			<View className="mt-4 flex-row flex-wrap gap-2">
				{interests.map((interest, index) => (
					<View
						key={interest}
						className={`rounded-full border border-white/10 px-3 py-1 ${
							palettes[index % palettes.length]
						}`}
					>
						<Text className="text-xs text-typography-white">{interest}</Text>
					</View>
				))}
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

const matchShadow: ViewStyle = {
	shadowColor: "#CF9A56",
	shadowOpacity: 0.45,
	shadowRadius: 28,
	shadowOffset: { width: 0, height: 18 },
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
