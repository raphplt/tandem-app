import { Trans } from "@lingui/react/macro";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
	CaretRight,
	GearSix,
	Globe,
	Palette,
	PencilSimpleLine,
	Question,
	ShieldCheck,
	SignOut as SignOutIcon,
} from "phosphor-react-native";
import { useMemo, useState, type ReactNode } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocale } from "@/hooks/use-locale";
import { useThemeStore, type ThemeMode } from "@/hooks/use-theme-store";
import { useMyProfile } from "@/src/hooks/use-profiles";

type AccentTone = "gold" | "rose" | "primary";

export default function SettingsScreen() {
	const { mode, setMode } = useThemeStore();
	const { locale, changeLocale } = useLocale();
	const { data: session } = useAuthSession();
	const { signOut } = useAuthActions();
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleThemeChange = (newMode: ThemeMode) => {
		setMode(newMode);
	};

	const handleLocaleChange = (newLocale: "en" | "fr") => {
		changeLocale(newLocale);
	};

	const { data: profile } = useMyProfile();

	const themeOptions = [
		{
			value: "light" as ThemeMode,
			label: <Trans id="settings-screen.light">Light</Trans>,
		},
		{
			value: "dark" as ThemeMode,
			label: <Trans id="settings-screen.dark">Dark</Trans>,
		},
		{
			value: "system" as ThemeMode,
			label: <Trans id="settings-screen.system">System</Trans>,
		},
	];

	const localeOptions: {
		value: "en" | "fr";
		label: ReactNode;
	}[] = [
		{ value: "en", label: <Trans id="settings-screen.english">English</Trans> },
		{ value: "fr", label: <Trans id="settings-screen.french">French</Trans> },
	];

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await signOut();
			router.replace("/(onboarding)/intro-values");
		} catch (error) {
			console.error("Failed to sign out", error);
		} finally {
			setIsSigningOut(false);
		}
	};

	const displayName = useMemo(() => {
		const first = session?.user?.firstName?.trim();
		const last = session?.user?.lastName?.trim();
		if (first || last) {
			return [first, last].filter(Boolean).join(" ");
		}
		return session?.user?.email ?? "-";
	}, [session?.user?.email, session?.user?.firstName, session?.user?.lastName]);

	const initials = useMemo(() => {
		if (!displayName) {
			return "?";
		}
		return displayName
			.split(" ")
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase())
			.slice(0, 2)
			.join("");
	}, [displayName]);

	const stats = useMemo(
		() => [
			{
				key: "views",
				label: <Trans id="settings-screen.stats.views">Vues</Trans>,
				value: profile?.viewCount ?? 0,
				tone: "gold" as const,
			},
			{
				key: "likes",
				label: <Trans id="settings-screen.stats.likes">Likes</Trans>,
				value: profile?.likeCount ?? 0,
				tone: "rose" as const,
			},
			{
				key: "matches",
				label: <Trans id="settings-screen.stats.matches">Matches</Trans>,
				value: profile?.matchCount ?? 0,
				tone: "gold" as const,
			},
		],
		[profile?.likeCount, profile?.matchCount, profile?.viewCount]
	);

	const accountItems = useMemo(
		() => [
			{
				key: "edit-profile",
				title: <Trans id="settings-screen.edit-profile">Éditer mon profil</Trans>,
				subtitle: (
					<Trans id="settings-screen.edit-profile.description">
						Met à jour ta bio, tes photos et tes préférences.
					</Trans>
				),
				icon: <PencilSimpleLine size={22} color="#9A6A00" weight="bold" />,
				iconWrapperClassName:
					"bg-accentGold-100/90 border border-accentGold-200/70 dark:bg-accentGold-900/30 dark:border-accentGold-800/60",
				onPress: () => router.push("/(onboarding)/bio" as never),
			},
			{
				key: "account-security",
				title: (
					<Trans id="settings-screen.account-security">Sécurité du compte</Trans>
				),
				subtitle: (
					<Trans id="settings-screen.account-security.description">
						Gestion des identifiants et contrôle de sécurité.
					</Trans>
				),
				icon: <ShieldCheck size={22} color="#9A6A00" weight="bold" />,
				iconWrapperClassName:
					"bg-accentGold-100/90 border border-accentGold-200/70 dark:bg-accentGold-900/30 dark:border-accentGold-800/60",
				onPress: () => router.push("/(onboarding)/auth-email-signin" as never),
			},
			{
				key: "preferences",
				title: <Trans id="settings-screen.preferences">Préférences Tandem</Trans>,
				subtitle: (
					<Trans id="settings-screen.preferences.description">
						Affiche les centres d’intérêt et valeurs que tu partages.
					</Trans>
				),
				icon: <GearSix size={22} color="#9A6A00" weight="bold" />,
				iconWrapperClassName:
					"bg-accentGold-100/90 border border-accentGold-200/70 dark:bg-accentGold-900/30 dark:border-accentGold-800/60",
				onPress: () => router.push("/(onboarding)/interests" as never),
			},
		],
		[router]
	);

	const supportItems = useMemo(
		() => [
			{
				key: "faq",
				title: <Trans id="settings-screen.help-center">Centre d’aide</Trans>,
				subtitle: (
					<Trans id="settings-screen.help-center.description">
						Consulte les réponses aux questions fréquentes.
					</Trans>
				),
				icon: <Question size={22} color="#7A2742" weight="bold" />,
				iconWrapperClassName:
					"bg-accentRose-100/90 border border-accentRose-200/70 dark:bg-accentRose-900/30 dark:border-accentRose-800/60",
				onPress: () => router.push("/(tabs)" as never),
			},
			{
				key: "contact",
				title: <Trans id="settings-screen.contact">Contacter le support</Trans>,
				subtitle: (
					<Trans id="settings-screen.contact.description">
						Besoin d’aide ? Écris-nous directement.
					</Trans>
				),
				icon: <Globe size={22} color="#7A2742" weight="bold" />,
				iconWrapperClassName:
					"bg-accentRose-100/90 border border-accentRose-200/70 dark:bg-accentRose-900/30 dark:border-accentRose-800/60",
				onPress: () => router.push("/(tabs)" as never),
			},
		],
		[router]
	);

	const OptionPill = ({
		label,
		isActive,
		onPress,
		tone = "primary",
	}: {
		label: React.ReactNode;
		isActive: boolean;
		onPress: () => void;
		tone?: AccentTone;
	}) => (
		<TouchableOpacity
			onPress={onPress}
			className={`rounded-full border px-4 py-2 ${(() => {
				if (!isActive) {
					return "border-outline-100 bg-white dark:border-outline-700 dark:bg-zinc-900";
				}
				switch (tone) {
					case "gold":
						return "border-accentGold-500 bg-accentGold-100/90 dark:border-accentGold-400 dark:bg-accentGold-900/30";
					case "rose":
						return "border-accentRose-500 bg-accentRose-100/90 dark:border-accentRose-400 dark:bg-accentRose-900/30";
					default:
						return "border-primary-500 bg-primary-50/80 dark:border-primary-400 dark:bg-primary-900/40";
				}
			})()}`}
		>
			<Text
				className={`text-sm ${(() => {
					if (!isActive) {
						return "text-typography-600 dark:text-typography-300";
					}
					switch (tone) {
						case "gold":
							return "font-semibold text-accentGold-700 dark:text-accentGold-200";
						case "rose":
							return "font-semibold text-accentRose-700 dark:text-accentRose-200";
						default:
							return "font-semibold text-primary-600 dark:text-secondary-100";
					}
				})()}`}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);

	const MenuGroup = ({
		title,
		description,
		items,
		children,
		tone = "primary",
	}: {
		title: ReactNode;
		description?: ReactNode;
		items?: {
			key: string;
			title: ReactNode;
			subtitle?: ReactNode;
			icon: ReactNode;
			onPress: () => void;
			variant?: "danger";
			iconWrapperClassName?: string;
		}[];
		children?: ReactNode;
		tone?: AccentTone;
	}) => (
		<Box
			className={`mb-6 rounded-3xl border px-5 py-6 ${(() => {
				switch (tone) {
					case "gold":
						return "border-accentGold-200 bg-accentGold-50/80 dark:border-accentGold-800/60 dark:bg-accentGold-900/30";
					case "rose":
						return "border-accentRose-200 bg-accentRose-50/80 dark:border-accentRose-800/60 dark:bg-accentRose-900/30";
					default:
						return "border-outline-100 bg-white/95 dark:border-outline-800 dark:bg-zinc-900/85";
				}
			})()}`}
		>
			<View className="flex flex-col gap-2">
				<Text className="text-lg font-semibold text-typography-900 dark:text-typography-50">
					{title}
				</Text>
				{description ? (
					<Text className="text-sm text-typography-600 dark:text-typography-300">
						{description}
					</Text>
				) : null}
			</View>
			{items ? (
				<View className="mt-5">
					{items.map((item, index) => (
						<TouchableOpacity
							key={item.key}
							onPress={item.onPress}
							className="relative flex-row items-center justify-between py-3"
						>
							<View className="flex-row items-center gap-4">
								<View
									className={`rounded-2xl p-3 ${
										item.iconWrapperClassName ?? "bg-secondary-100 dark:bg-primary-800"
									}`}
								>
									{item.icon}
								</View>
								<View className="max-w-[230px] flex-col gap-1">
									<Text
										className={`text-base font-semibold ${
											item.variant === "danger"
												? "text-error-600"
												: "text-typography-900 dark:text-typography-50"
										}`}
									>
										{item.title}
									</Text>
									{item.subtitle ? (
										<Text className="text-sm text-typography-500 dark:text-typography-300">
											{item.subtitle}
										</Text>
									) : null}
								</View>
							</View>
							<CaretRight size={20} color="#9CA3AF" weight="bold" />
							{index < items.length - 1 ? (
								<View className="absolute bottom-0 left-14 right-0 h-px bg-outline-100 dark:bg-outline-800" />
							) : null}
						</TouchableOpacity>
					))}
				</View>
			) : null}
			{children ? <View className="mt-5 gap-5">{children}</View> : null}
		</Box>
	);

	return (
		<SafeAreaView className="flex-1 bg-background-0 px-6 pb-6 dark:bg-background-dark">
			<ScrollView
				contentContainerStyle={{ paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				<Text className="mb-6 text-3xl font-bold text-typography-900 dark:text-typography-50">
					<Trans id="settings-screen.title">Profil & paramètres</Trans>
				</Text>

				<Box className="relative mb-8 overflow-hidden rounded-3xl border border-accentGold-200 bg-accentGold-50/80 px-6 py-8 dark:border-accentGold-800 dark:bg-accentGold-900/30">
					<View className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-accentRose-200/60 dark:bg-accentRose-800/40" />
					<View className="pointer-events-none absolute -bottom-14 left-8 h-28 w-28 rounded-full bg-accentGold-200/50 dark:bg-accentGold-800/40" />
					<View className="relative z-10">
						<View className="flex-row items-start justify-between">
							<View className="flex-row items-center gap-4">
								<View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-accentGold-400 bg-white dark:border-accentGold-600 dark:bg-zinc-900">
								{profile?.photoUrl ? (
									<Image
										source={{ uri: profile.photoUrl }}
										style={{ width: "100%", height: "100%" }}
										contentFit="cover"
									/>
								) : (
									<Text className="text-xl font-semibold text-accentGold-700 dark:text-accentGold-200">
										{initials}
									</Text>
								)}
							</View>
							<View className="flex-col gap-1">
								<Text className="text-2xl font-semibold text-typography-900 dark:text-typography-50">
									{displayName}
								</Text>
								<Text className="text-sm text-typography-500 dark:text-typography-300">
									{session?.user?.email}
								</Text>
							</View>
						</View>
						<TouchableOpacity
							onPress={() => router.push("/(onboarding)/photos" as never)}
							className="rounded-full border border-accentRose-400 bg-accentRose-100/80 px-4 py-2 dark:border-accentRose-700 dark:bg-accentRose-900/30"
						>
							<View className="flex-row items-center gap-2">
								<PencilSimpleLine size={18} color="#7A2742" weight="bold" />
								<Text className="text-sm font-medium text-accentRose-700 dark:text-accentRose-200">
									<Trans id="settings-screen.update-photo">Modifier</Trans>
								</Text>
							</View>
						</TouchableOpacity>
					</View>

					<View className="mt-6 flex-row flex-wrap gap-3">
						{profile?.age ? (
							<View className="rounded-full bg-accentGold-100/80 px-4 py-1.5 dark:bg-accentGold-900/30">
								<Text className="text-xs font-semibold text-accentGold-700 dark:text-accentGold-200">
									{profile.age} <Trans id="settings-screen.years">ans</Trans>
								</Text>
							</View>
						) : null}
						{profile?.city ? (
							<View className="rounded-full bg-accentRose-100/80 px-4 py-1.5 dark:bg-accentRose-900/30">
								<Text className="text-xs font-semibold text-accentRose-700 dark:text-accentRose-200">
									{profile.city}
								</Text>
							</View>
						) : null}
						{profile?.country ? (
							<View className="rounded-full bg-accentGold-100/60 px-4 py-1.5 dark:bg-accentGold-900/30">
								<Text className="text-xs font-semibold text-accentGold-700 dark:text-accentGold-200">
									{profile.country}
								</Text>
							</View>
						) : null}
					</View>

					{profile?.bio ? (
						<Text className="mt-4 text-sm text-typography-600 dark:text-typography-300">
							{profile.bio}
						</Text>
					) : null}

					<View className="mt-6 flex-row justify-between gap-3">
						{stats.map((item) => (
							<View
								key={item.key}
								className={`flex-1 items-center rounded-2xl border px-4 py-3 ${
									item.tone === "rose"
										? "border-accentRose-200 bg-accentRose-50/80 dark:border-accentRose-800/60 dark:bg-accentRose-900/30"
										: "border-accentGold-200 bg-accentGold-50/80 dark:border-accentGold-800/60 dark:bg-accentGold-900/30"
								}`}
							>
								<Text
									className={`text-xl font-semibold ${
										item.tone === "rose"
											? "text-accentRose-700 dark:text-accentRose-200"
											: "text-accentGold-700 dark:text-accentGold-200"
									}`}
								>
									{item.value}
								</Text>
								<Text
									className={`text-xs uppercase tracking-wide ${
										item.tone === "rose"
											? "text-accentRose-600 dark:text-accentRose-300"
											: "text-accentGold-600 dark:text-accentGold-300"
									}`}
								>
									{item.label}
								</Text>
							</View>
						))}
					</View>
					</View>
				</Box>

				<MenuGroup
					title={<Trans id="settings-screen.section.account">Compte</Trans>}
					tone="gold"
					description={
						<Trans id="settings-screen.section.account.description">
							Garde ton profil à jour et gère tes paramètres Tandem.
						</Trans>
					}
					items={accountItems}
				/>

				<MenuGroup
					tone="rose"
					title={
						<Trans id="settings-screen.section.personalization">
							Personnalisation
						</Trans>
					}
					description={
						<Trans id="settings-screen.section.personalization.description">
							Choisis ton expérience en ajustant la langue et le thème.
						</Trans>
					}
				>
					<View className="flex-col gap-3">
						<View className="flex-row items-center gap-3">
							<View className="rounded-2xl border border-accentGold-200/60 bg-accentGold-100/80 p-3 dark:border-accentGold-800/60 dark:bg-accentGold-900/30">
								<Globe size={20} color="#9A6A00" weight="bold" />
							</View>
							<View className="flex-1">
								<Text className="text-base font-semibold text-typography-900 dark:text-typography-50">
									<Trans id="settings-screen.language">Langue</Trans>
								</Text>
								<View className="mt-2 flex-row flex-wrap gap-2">
									{localeOptions.map((option) => (
										<OptionPill
											key={option.value}
											label={option.label}
											isActive={locale === option.value}
											onPress={() => handleLocaleChange(option.value)}
											tone="gold"
										/>
									))}
								</View>
							</View>
						</View>
						<View className="flex-row items-center gap-3">
							<View className="rounded-2xl border border-accentRose-200/60 bg-accentRose-100/80 p-3 dark:border-accentRose-800/60 dark:bg-accentRose-900/30">
								<Palette size={20} color="#7A2742" weight="bold" />
							</View>
							<View className="flex-1">
								<Text className="text-base font-semibold text-typography-900 dark:text-typography-50">
									<Trans id="settings-screen.theme">Thème</Trans>
								</Text>
								<View className="mt-2 flex-row flex-wrap gap-2">
									{themeOptions.map((option) => (
										<OptionPill
											key={option.value}
											label={option.label}
											isActive={mode === option.value}
											onPress={() => handleThemeChange(option.value)}
											tone="rose"
										/>
									))}
								</View>
							</View>
						</View>
					</View>
				</MenuGroup>

				<MenuGroup
					tone="rose"
					title={<Trans id="settings-screen.section.support">Aide & support</Trans>}
					description={
						<Trans id="settings-screen.section.support.description">
							Retrouve de l’aide ou contacte l’équipe Tandem.
						</Trans>
					}
					items={supportItems}
				/>

				<MenuGroup
					title={<Trans id="settings-screen.section.danger">Déconnexion</Trans>}
					description={
						<Trans id="settings-screen.section.danger.description">
							Se déconnecter de ton compte Tandem sur cet appareil.
						</Trans>
					}
					items={[
						{
							key: "sign-out",
							title: isSigningOut ? (
								<Trans id="settings-screen.signing-out">Déconnexion en cours…</Trans>
							) : (
								<Trans id="settings-screen.sign-out">Se déconnecter</Trans>
							),
							subtitle: (
								<Trans id="settings-screen.sign-out.description">
									Tu pourras te reconnecter à tout moment.
								</Trans>
							),
							icon: <SignOutIcon size={22} color="#DC2626" weight="bold" />,
							onPress: handleSignOut,
							variant: "danger",
						},
					]}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}
